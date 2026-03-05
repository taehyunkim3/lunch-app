'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import styles from './page.module.css'

const PASSWORD: string = process.env.NEXT_PUBLIC_APP_PASSWORD ?? 'lunch2024'

const COLORS: string[] = [
  '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB', '#FF9FF3',
  '#54A0FF', '#5F27CD', '#00D2D3', '#1DD1A1', '#C8D6E5',
  '#FF6348', '#FFA502', '#2ED573', '#1E90FF', '#FF4757',
  '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00CEC9',
]

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

interface User {
  name: string
  color: string
}

interface Vote {
  restaurant: string
  name: string
  color: string
}

interface PresenceUser {
  name: string
  color: string
}

// ───── Login Screen ─────
interface LoginScreenProps {
  onLogin: (name: string, color: string) => void
}

function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pw, setPw] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [step, setStep] = useState<'password' | 'name'>('password')
  const [error, setError] = useState<string>('')
  const [shake, setShake] = useState<boolean>(false)

  const handlePassword = (): void => {
    if (pw === PASSWORD) {
      setError('')
      setStep('name')
    } else {
      setError('비밀번호가 틀렸어요')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPw('')
    }
  }

  const handleName = (): void => {
    const trimmed = name.trim()
    if (!trimmed) { setError('이름을 입력해주세요'); return }
    if (trimmed.length > 10) { setError('이름은 10자 이하로'); return }
    onLogin(trimmed, getRandomColor())
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard + (shake ? ' ' + styles.shake : '')}>
        <div className={styles.loginEmoji}>🍱</div>
        <h1 className={styles.loginTitle}>점심 뭐먹지</h1>
        <p className={styles.loginSub}>오늘 점심 같이 정해요</p>

        {step === 'password' ? (
          <div className={styles.loginForm}>
            <input
              type="password"
              placeholder="비밀번호"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePassword()}
              className={styles.loginInput}
              autoFocus
            />
            {error && <p className={styles.loginError}>{error}</p>}
            <button onClick={handlePassword} className={styles.loginBtn}>
              입장하기
            </button>
          </div>
        ) : (
          <div className={styles.loginForm}>
            <input
              type="text"
              placeholder="이름 (닉네임)"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleName()}
              className={styles.loginInput}
              maxLength={10}
              autoFocus
            />
            {error && <p className={styles.loginError}>{error}</p>}
            <button onClick={handleName} className={styles.loginBtn}>
              시작하기 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ───── Restaurant Card ─────
interface RestaurantCardProps {
  restaurant: string
  voters: Vote[]
  currentUser: User
  onVote: (restaurant: string) => Promise<void>
  onRemove: (name: string) => Promise<void>
  onRemoveVote: (restaurant: string, userName: string) => Promise<void>
}

function RestaurantCard({ restaurant, voters, currentUser, onVote, onRemove, onRemoveVote }: RestaurantCardProps) {
  const isSelected = voters.some(v => v.name === currentUser.name)

  return (
    <div
      className={styles.card + (isSelected ? ' ' + styles.cardSelected : '')}
      onClick={() => onVote(restaurant)}
    >
      <button
        className={styles.removeBtn}
        onClick={(e) => { e.stopPropagation(); onRemove(restaurant) }}
      >✕</button>

      <div className={styles.cardTop}>
        <span className={styles.cardName}>{restaurant}</span>
        {voters.length > 0 && (
          <span className={styles.voteCount}>{voters.length}명</span>
        )}
      </div>

      {voters.length > 0 && (
        <div className={styles.voterRow}>
          {voters.map((v, i) => (
            <span
              key={i}
              className={styles.voterChip}
              style={{ borderColor: v.color, color: v.color }}
              onClick={(e) => e.stopPropagation()}
            >
              {v.name}
              <button
                className={styles.voterChipDel}
                onClick={(e) => { e.stopPropagation(); onRemoveVote(restaurant, v.name) }}
              >×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ───── Main App ─────
export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [restaurants, setRestaurants] = useState<string[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [newRestaurant, setNewRestaurant] = useState<string>('')
  const [adding, setAdding] = useState<boolean>(false)
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem('lunch_user')
    if (saved) setUser(JSON.parse(saved) as User)
  }, [])

  const handleLogin = (name: string, color: string): void => {
    const u: User = { name, color }
    setUser(u)
    sessionStorage.setItem('lunch_user', JSON.stringify(u))
  }

  // Fetch initial data
  const fetchData = useCallback(async (): Promise<void> => {
    const [{ data: rData }, { data: vData }] = await Promise.all([
      supabase.from('restaurants').select('name').order('created_at', { ascending: true }),
      supabase.from('votes').select('restaurant, user_name, user_color'),
    ])
    if (rData) setRestaurants(rData.map(r => r.name))
    if (vData) setVotes(vData.map(v => ({ restaurant: v.restaurant, name: v.user_name, color: v.user_color })))
  }, [])

  useEffect(() => {
    if (!user) return
    fetchData()

    const channel = supabase.channel('lunch_realtime')

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => fetchData())
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users: PresenceUser[] = Object.values(state).flat().map(({ name, color }) => ({ name, color }))
        setOnlineUsers(users)
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ name: user.name, color: user.color })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [user, fetchData])

  const handleVote = async (restaurant: string): Promise<void> => {
    if (!user) return
    const already = votes.some(v => v.restaurant === restaurant && v.name === user.name)

    if (already) {
      setVotes(prev => prev.filter(v => !(v.restaurant === restaurant && v.name === user.name)))
      await supabase.from('votes').delete().eq('restaurant', restaurant).eq('user_name', user.name)
    } else {
      setVotes(prev => [...prev, { restaurant, name: user.name, color: user.color }])
      await supabase.from('votes').insert({ restaurant, user_name: user.name, user_color: user.color })
    }
  }

  const handleRemoveVote = async (restaurant: string, userName: string): Promise<void> => {
    setVotes(prev => prev.filter(v => !(v.restaurant === restaurant && v.name === userName)))
    await supabase.from('votes').delete().eq('restaurant', restaurant).eq('user_name', userName)
  }

  const handleResetAll = async (): Promise<void> => {
    if (confirm('모든 투표를 초기화할까요?')) {
      setVotes([])
      await supabase.from('votes').delete().neq('id', 0)
    }
  }

  const handleRemoveRestaurant = async (name: string): Promise<void> => {
    await supabase.from('restaurants').delete().eq('name', name)
  }

  const handleAddRestaurant = async (): Promise<void> => {
    const trimmed = newRestaurant.trim()
    if (!trimmed) return
    if (restaurants.includes(trimmed)) {
      alert('이미 있는 식당이에요!')
      return
    }
    setAdding(false)
    setNewRestaurant('')
    await supabase.from('restaurants').insert({ name: trimmed })
  }

  const todayStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

  const votesByRestaurant = restaurants.reduce<Record<string, Vote[]>>((acc, r) => {
    acc[r] = votes.filter(v => v.restaurant === r)
    return acc
  }, {})

  if (!user) return <LoginScreen onLogin={handleLogin} />

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerEmoji}>🍱</span>
          <span className={styles.headerTitle}>점심 뭐먹지</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.onlineCount}>
            <span className={styles.onlineDot} />
            {onlineUsers.length}명 접속중
          </div>
          <div
            className={styles.myTag}
            style={{ borderColor: user.color, color: user.color }}
          >
            {user.name}
          </div>
        </div>
      </header>

      {/* Online users */}
      {onlineUsers.length > 0 && (
        <div className={styles.onlineBar}>
          {onlineUsers.map((u, i) => (
            <span key={i} className={styles.onlineChip} style={{ color: u.color, borderColor: u.color + '44' }}>
              {u.name}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <main className={styles.main}>
        <div className={styles.hintRow}>
          <p className={styles.hint}>🗓 {todayStr} · 식당을 탭해서 투표하세요 👆</p>
          <button className={styles.resetBtn} onClick={handleResetAll}>전체 리셋</button>
        </div>

        <div className={styles.grid}>
          {restaurants.map(r => (
            <RestaurantCard
              key={r}
              restaurant={r}
              voters={votesByRestaurant[r] ?? []}
              currentUser={user}
              onVote={handleVote}
              onRemove={handleRemoveRestaurant}
              onRemoveVote={handleRemoveVote}
            />
          ))}

          {/* Add card */}
          {adding ? (
            <div className={styles.addCard}>
              <input
                autoFocus
                type="text"
                placeholder="식당 이름"
                value={newRestaurant}
                onChange={e => setNewRestaurant(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddRestaurant()
                  if (e.key === 'Escape') { setAdding(false); setNewRestaurant('') }
                }}
                className={styles.addInput}
                maxLength={20}
              />
              <div className={styles.addActions}>
                <button onClick={handleAddRestaurant} className={styles.addConfirm}>추가</button>
                <button onClick={() => { setAdding(false); setNewRestaurant('') }} className={styles.addCancel}>취소</button>
              </div>
            </div>
          ) : (
            <button className={styles.addBtn} onClick={() => setAdding(true)}>
              <span>+</span>
              <span>식당 추가</span>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
