// Munch — Restaurant discovery prototype
// Single-file React app inside an iPhone frame

const { useState, useEffect, useRef, useCallback } = React;

// ─────────────────────────────────────────────────────────────
// Data — 12 real-ish 公館/師大/台大 spots, with food-matched Unsplash photos
// ─────────────────────────────────────────────────────────────
const RESTAURANTS = [
{ id: 1, name: '雙月食品社（公館店）', meta: '雞湯・養生小吃', dist: 280, rating: 4.6,
  img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=80' }, // chicken soup
{ id: 2, name: '藍家割包', meta: '割包・台式三明治', dist: 450, rating: 4.4,
  img: 'https://images.unsplash.com/photo-1606755962773-d324e2dabd1a?w=900&q=80' }, // gua bao
{ id: 3, name: '龍涎居雞膳食坊', meta: '雞湯・雞肉飯', dist: 320, rating: 4.3,
  img: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=900&q=80' }, // chicken rice
{ id: 4, name: '滷蛋伯麵食館', meta: '牛肉麵・小菜', dist: 600, rating: 4.5,
  img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=900&q=80' }, // beef noodle
{ id: 5, name: '雪王冰淇淋', meta: '古早味冰淇淋', dist: 720, rating: 4.4,
  img: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=900&q=80' }, // ice cream
{ id: 6, name: '永和鹹豆漿', meta: '早餐・豆漿燒餅', dist: 410, rating: 4.2,
  img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=80' }, // breakfast
{ id: 7, name: '麻膳堂 MaZendo', meta: '牛肉麵・拌麵', dist: 380, rating: 4.3,
  img: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=900&q=80' }, // noodles
{ id: 8, name: '人從眾水餃食堂', meta: '水餃・小菜', dist: 530, rating: 4.5,
  img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=900&q=80' }, // dumplings
{ id: 9, name: '古亭烤雞', meta: '碳烤雞・便當', dist: 290, rating: 4.4,
  img: 'https://images.unsplash.com/photo-1598103442257-8c4c763cea83?w=900&q=80' }, // roast chicken
{ id: 10, name: '雞家莊', meta: '台菜・三杯雞', dist: 670, rating: 4.3,
  img: 'https://images.unsplash.com/photo-1625938145744-533e82c1d9b1?w=900&q=80' }, // taiwanese
{ id: 11, name: '老蔡水煎包', meta: '水煎包・小籠包', dist: 220, rating: 4.2,
  img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=900&q=80' }, // pan-fried bun fallback
{ id: 12, name: '阿英排骨飯', meta: '排骨飯・自助餐', dist: 480, rating: 4.4,
  img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=900&q=80' } // pork chop rice
];

// ─────────────────────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────────────────────
const LS_WELCOME = 'munch_welcome_seen';
const LS_FEEDBACK = 'munch_feedback';
const LS_SWIPED = 'munch_swiped_count';

const lsGet = (k, fallback) => {
  try {const v = localStorage.getItem(k);return v == null ? fallback : JSON.parse(v);}
  catch {return fallback;}
};
const lsSet = (k, v) => {
  try {localStorage.setItem(k, JSON.stringify(v));} catch {}
};

// ─────────────────────────────────────────────────────────────
// Icons (inline SVG, no deps)
// ─────────────────────────────────────────────────────────────
const Icon = {
  X: ({ size = 28, color = '#FF4757', stroke = 2.6 }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </svg>,

  Heart: ({ size = 28, color = '#FF6B9D', stroke = 2.6, fill = 'none' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"
    stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
    </svg>,

  Star: ({ size = 14, color = '#FFD43B' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l3 7 7.5.6-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4-5.7-5L9 9z" />
    </svg>,

  Pin: ({ size = 13, color = 'rgba(255,255,255,0.92)' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="2" />
    </svg>,

  Avatar: ({ size = 30 }) =>
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#1a1a1a" strokeWidth="1.6" />
      <circle cx="16" cy="13" r="4.2" stroke="#1a1a1a" strokeWidth="1.6" />
      <path d="M7 27c1.6-4.5 5-6.5 9-6.5s7.4 2 9 6.5" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>,

  Menu: ({ size = 26 }) =>
  <svg width={size} height={size} viewBox="0 0 26 18" fill="none">
      <path d="M1 2h24M1 9h24M1 16h24" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" />
    </svg>,

  Nav: ({ size = 26, color = '#fff' }) =>
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 11l18-8-8 18-2-8-8-2z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    </svg>

};

// ─────────────────────────────────────────────────────────────
// Welcome screen
// ─────────────────────────────────────────────────────────────
function Welcome({ onStart }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#fff',
      display: 'flex', flexDirection: 'column',
      padding: '120px 32px 56px', zIndex: 100
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.04em', color: '#1a1a1a', lineHeight: 1 }}>
          Munch
          <span style={{ color: '#FF6B35' }}>.</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginTop: 18, letterSpacing: '-0.01em' }}>
          找餐廳，不靠業配
        </div>
        <div style={{ height: 1, background: '#eee', margin: '40px 0 28px' }} />
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
          ['看到喜歡的', '右滑收藏', '#FF6B9D'],
          ['不喜歡', '左滑跳過', '#FF4757'],
          ['想直接去', '按 GO 導航', '#FF6B35']].
          map(([t, sub, c], i) =>
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
              width: 8, height: 8, borderRadius: 8, background: c, flexShrink: 0
            }} />
              <div style={{ fontSize: 17, color: '#1a1a1a' }}>
                <span style={{ fontWeight: 700 }}>{t}</span>
                <span style={{ color: '#888' }}> · {sub}</span>
              </div>
            </li>
          )}
        </ol>
      </div>
      <button onClick={onStart} style={{
        height: 60, borderRadius: 999, border: 'none', background: '#FF6B35',
        color: '#fff', fontSize: 19, fontWeight: 800, letterSpacing: '0.02em',
        boxShadow: '0 12px 30px rgba(255,107,53,0.35)', cursor: 'pointer'
      }}>開始</button>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#aaa' }}>
        prototype · v0.1
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Card — image + overlay info
// ─────────────────────────────────────────────────────────────
const Card = React.forwardRef(function Card({ r, style, dragX = 0, dragY = 0, upStrength = 0, isTop = false, ...rest }, ref) {
  // Horizontal swipe takes precedence; up-swipe shown only when vertical dominates
  const upActive = upStrength > 0.05 && Math.abs(dragY) > Math.abs(dragX);
  const strength = upActive ? 0 : Math.min(Math.abs(dragX) / 140, 1);
  const dir = dragX > 0 ? 'right' : 'left';
  const glowColor = dir === 'right' ? '255,107,157' : '255,71,87';

  return (
    <div ref={ref} {...rest} style={{
      position: 'absolute', inset: 0,
      borderRadius: 22, overflow: 'hidden',
      background: '#1a1a1a',
      boxShadow: '0 18px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)',
      userSelect: 'none', touchAction: 'none',
      ...style
    }}>
      <img src={r.img} alt={r.name} draggable={false} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', pointerEvents: 'none'
      }} />
      {/* bottom gradient for legibility */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 100%)'
      }} />

      {/* Direction glow + stamp */}
      {isTop && strength > 0.05 &&
      <>
          <div style={{
          position: 'absolute', inset: 0,
          boxShadow: `inset 0 0 0 6px rgba(${glowColor},${strength})`,
          borderRadius: 22, pointerEvents: 'none'
        }} />
          <div style={{
          position: 'absolute', top: 28,
          [dir === 'right' ? 'left' : 'right']: 24,
          transform: `rotate(${dir === 'right' ? -14 : 14}deg)`,
          border: `4px solid rgba(${glowColor},${Math.min(strength * 1.2, 1)})`,
          color: `rgba(${glowColor},${Math.min(strength * 1.2, 1)})`,
          fontWeight: 900, fontSize: 30, letterSpacing: '0.05em',
          padding: '6px 14px', borderRadius: 8,
          opacity: strength
        }}>
            {dir === 'right' ? '收藏' : '跳過'}
          </div>
        </>
      }

      {/* Up-swipe GO hint */}
      {isTop && upActive &&
      <>
          <div style={{
          position: 'absolute', inset: 0,
          boxShadow: `inset 0 0 0 6px rgba(255,107,53,${upStrength})`,
          borderRadius: 22, pointerEvents: 'none'
        }} />
          <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: `translate(-50%, -50%) scale(${0.8 + upStrength * 0.3})`,
          border: `5px solid rgba(255,107,53,${Math.min(upStrength * 1.2, 1)})`,
          color: `rgba(255,107,53,${Math.min(upStrength * 1.2, 1)})`,
          fontWeight: 900, fontSize: 44, letterSpacing: '0.1em',
          padding: '10px 26px', borderRadius: 14,
          opacity: upStrength,
          background: `rgba(255,255,255,${upStrength * 0.85})`,
          pointerEvents: 'none'
        }}>
            GO
          </div>
        </>
      }

      {/* text overlay */}
      <div style={{
        position: 'absolute', left: 20, right: 20, bottom: 22,
        color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.15
        }}>{r.name}</div>
        <div style={{
          marginTop: 6, display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 14, color: 'rgba(255,255,255,0.92)'
        }}>
          <Icon.Pin />
          <span>距離 {r.dist}m</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <Icon.Star />
          <span>{r.rating.toFixed(1)}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ opacity: 0.85 }}>{r.meta}</span>
        </div>
      </div>
    </div>);

});

// ─────────────────────────────────────────────────────────────
// Card stack with drag/swipe
// ─────────────────────────────────────────────────────────────
function CardStack({ deck, onSwipe, onGo }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [exiting, setExiting] = useState(null); // { dir: 'left'|'right' }
  const startRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const top = deck[0];
  const peek = deck[1];

  const widthThreshold = 0.30; // 30% of card width

  const begin = (clientX, clientY) => {
    if (exiting) return;
    startRef.current = { x: clientX, y: clientY };
    setDrag({ x: 0, y: 0, dragging: true });
  };
  const move = (clientX, clientY) => {
    if (!drag.dragging) return;
    setDrag({
      x: clientX - startRef.current.x,
      y: (clientY - startRef.current.y) * 0.4, // damped vertical
      dragging: true
    });
  };
  const end = () => {
    if (!drag.dragging) return;
    const cardWidth = cardRef.current ? cardRef.current.offsetWidth : 320;
    const threshold = cardWidth * widthThreshold;
    if (drag.x > threshold) {
      flyOut('right');
    } else if (drag.x < -threshold) {
      flyOut('left');
    } else {
      // snap back
      setDrag({ x: 0, y: 0, dragging: false });
    }
  };

  const flyOut = (dir) => {
    setExiting({ dir });
    // schedule swipe completion
    setTimeout(() => {
      onSwipe(dir, top);
      setExiting(null);
      setDrag({ x: 0, y: 0, dragging: false });
    }, 300);
  };

  // Mouse events
  const onMouseDown = (e) => {begin(e.clientX, e.clientY);};
  useEffect(() => {
    if (!drag.dragging) return;
    const mm = (e) => move(e.clientX, e.clientY);
    const mu = () => end();
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
  }, [drag.dragging]);

  // Touch
  const onTouchStart = (e) => {const t = e.touches[0];begin(t.clientX, t.clientY);};
  const onTouchMove = (e) => {const t = e.touches[0];move(t.clientX, t.clientY);};
  const onTouchEnd = () => end();

  // Compute transforms
  const upStrength = drag.y < 0 ? Math.min(-drag.y / 110, 1) : 0;
  const visualY = drag.y < 0 ? drag.y : drag.y * 0.4;
  let topTransform = `translate(${drag.x}px, ${visualY}px) rotate(${drag.x * 0.06}deg)`;
  let topTransition = drag.dragging ? 'none' : 'transform 220ms cubic-bezier(.2,.8,.2,1)';
  let dragXVisual = drag.x;

  if (exiting) {
    const sign = exiting.dir === 'right' ? 1 : -1;
    topTransform = `translate(${sign * 600}px, 60px) rotate(${sign * 30}deg)`;
    topTransition = 'transform 300ms ease-out, opacity 300ms ease-out';
    dragXVisual = sign * 200;
  }

  if (!top) {
    return <EmptyState />;
  }

  return (
    <div style={{
      position: 'relative', flex: 1, margin: '0 16px',
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ position: 'relative', flex: 1 }}>
        {/* Peek card behind */}
        {peek &&
        <Card r={peek} style={{
          transform: `scale(${0.95 + Math.min(Math.abs(drag.x) / 600, 0.05)}) translateY(${10 - Math.min(Math.abs(drag.x) / 40, 10)}px)`,
          transition: drag.dragging ? 'transform 80ms linear' : 'transform 220ms cubic-bezier(.2,.8,.2,1)',
          zIndex: 1
        }} />
        }
        {/* Top card */}
        <Card
          r={top}
          isTop
          dragX={dragXVisual}
          dragY={drag.y}
          upStrength={upStrength}
          style={{
            transform: topTransform,
            transition: topTransition,
            opacity: exiting ? 0 : 1,
            zIndex: 2,
            cursor: drag.dragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={cardRef} />
        
      </div>

      {/* Bottom action buttons */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 26, padding: '20px 0 8px'
      }}>
        <ActionButton
          variant="skip"
          onClick={() => !exiting && flyOut('left')} />
        
        <GoButton onClick={() => onGo(top)} />
        <ActionButton
          variant="like"
          onClick={() => !exiting && flyOut('right')} />
        
      </div>
    </div>);

}

function ActionButton({ variant, onClick }) {
  const isSkip = variant === 'skip';
  const color = isSkip ? '#FF4757' : '#FF6B9D';
  return (
    <button onClick={onClick} style={{
      width: 56, height: 56, borderRadius: 999,
      border: `2px solid ${color}`, background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      transition: 'transform 120ms'
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
    onMouseUp={(e) => e.currentTarget.style.transform = ''}
    onMouseLeave={(e) => e.currentTarget.style.transform = ''}>
      
      {isSkip ? <Icon.X /> : <Icon.Heart />}
    </button>);

}

function GoButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 78, height: 78, borderRadius: 999,
      border: 'none',
      color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: '0.04em',
      cursor: 'pointer',
      boxShadow: '0 14px 28px rgba(255,107,53,0.45), inset 0 -3px 0 rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform 120ms', background: "rgb(255, 134, 39)"
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.94)'}
    onMouseUp={(e) => e.currentTarget.style.transform = ''}
    onMouseLeave={(e) => e.currentTarget.style.transform = ''}>
      GO</button>);

}

function EmptyState() {
  return (
    <div style={{
      flex: 1, margin: '0 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', color: '#666'
    }}>
      <div style={{ fontSize: 64, marginBottom: 12 }}>🍜</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a' }}>都看完了</div>
      <div style={{ fontSize: 14, marginTop: 6, color: '#888' }}>稍後再回來看看新店家</div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// GO modal
// ─────────────────────────────────────────────────────────────
function GoModal({ restaurant, onConfirm, onCancel }) {
  if (!restaurant) return null;
  return (
    <ModalShell onBackdrop={onCancel}>
      <div style={{ padding: '28px 24px 22px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 999, background: '#FFF1EB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Icon.Nav color="#FF6B35" size={28} />
        </div>
        <div style={{
          fontSize: 17, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', lineHeight: 1.45
        }}>
          即將開啟 Google Maps 導航至
        </div>
        <div style={{
          fontSize: 19, fontWeight: 800, color: '#FF6B35',
          textAlign: 'center', marginTop: 6
        }}>
          【{restaurant.name}】
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onCancel} style={modalBtn('ghost')}>取消</button>
          <button onClick={onConfirm} style={modalBtn('primary')}>確認</button>
        </div>
      </div>
    </ModalShell>);

}

const modalBtn = (kind) => ({
  flex: 1, height: 50, borderRadius: 14, border: 'none', cursor: 'pointer',
  fontSize: 16, fontWeight: 800,
  background: kind === 'primary' ? '#FF6B35' : '#F2F2F2',
  color: kind === 'primary' ? '#fff' : '#1a1a1a'
});

function ModalShell({ children, onBackdrop }) {
  return (
    <div onClick={onBackdrop} style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'munch-fade 180ms ease-out'
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 22, width: '100%', maxWidth: 340,
        boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
        animation: 'munch-pop 220ms cubic-bezier(.2,.8,.2,1)'
      }}>
        {children}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Feedback panel
// ─────────────────────────────────────────────────────────────
function FeedbackPanel({ onClose, onSubmitted }) {
  const [a1, setA1] = useState(null);
  const [a2, setA2] = useState(3);
  const [a3, setA3] = useState(null);
  const [a4, setA4] = useState(null);
  const [a5, setA5] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    const entry = {
      ts: new Date().toISOString(),
      continue_use: a1,
      vs_alternatives: a2,
      first_open: a3,
      tried_new: a4,
      wishlist: a5.slice(0, 100)
    };
    const arr = lsGet(LS_FEEDBACK, []);
    arr.push(entry);
    lsSet(LS_FEEDBACK, arr);
    setSubmitted(true);
    onSubmitted && onSubmitted(entry);
  };

  const canSubmit = a1 && a3 && a4;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 250,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'munch-fade 180ms ease-out'
    }}>
      <div style={{
        background: '#fff', width: '100%', maxHeight: '92%',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        overflow: 'auto',
        animation: 'munch-slideup 280ms cubic-bezier(.2,.8,.2,1)'
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 4, background: '#ddd',
          margin: '10px auto 0'
        }} />

        {!submitted ?
        <div style={{ padding: '20px 22px 28px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
              謝謝你試用 🙏
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 6, lineHeight: 1.5 }}>
              可以花 1 分鐘給我們回饋嗎？對後續設計超有幫助。
            </div>

            <Q num={1} title="你會繼續用這個 App 嗎？">
              <Choices value={a1} options={['會', '看情況', '不會']} onChange={setA1} />
            </Q>

            <Q num={2} title="跟你現在找餐廳的方式（Google Maps / IG / 朋友推薦）比，這個讓你更想用嗎？">
              <SliderInput value={a2} onChange={setA2}
            leftLabel="完全不會" rightLabel="一定用這個" />
            </Q>

            <Q num={3} title="如果今晚要決定吃什麼，你最可能先打開哪個？">
              <Choices value={a3} options={['Google Maps', 'IG', 'Foodpanda', '朋友群組', '這個 App', '其他']} onChange={setA3} wrap />
            </Q>

            <Q num={4} title="這個介面有讓你想去某家你原本不會去的店嗎？">
              <Choices value={a4} options={['有', '沒有', '還不確定']} onChange={setA4} />
            </Q>

            <Q num={5} title="你最想加什麼一個功能？">
              <textarea value={a5} maxLength={100}
            onChange={(e) => setA5(e.target.value)}
            placeholder="自由輸入（最多 100 字）"
            style={{
              width: '100%', minHeight: 78, resize: 'none',
              border: '1px solid #e5e5e5', borderRadius: 12,
              padding: '12px 14px', fontSize: 15, color: '#1a1a1a',
              fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none'
            }} />
            
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 4, textAlign: 'right' }}>
                {a5.length}/100
              </div>
            </Q>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={onClose} style={modalBtn('ghost')}>稍後再說</button>
              <button onClick={submit} disabled={!canSubmit}
            style={{ ...modalBtn('primary'), opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
                送出
              </button>
            </div>
          </div> :

        <div style={{ padding: '36px 24px 36px', textAlign: 'center' }}>
            <div style={{
            width: 64, height: 64, borderRadius: 999, background: '#FFF1EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 32
          }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>謝謝！</div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 6 }}>
              可以繼續滑也可以關閉。
            </div>
            <button onClick={onClose} style={{ ...modalBtn('primary'), marginTop: 22, width: '100%' }}>
              繼續滑卡片
            </button>
          </div>
        }
      </div>
    </div>);

}

function Q({ num, title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: '#FF6B35',
          background: '#FFF1EB', padding: '2px 7px', borderRadius: 6
        }}>{num}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, flex: 1 }}>
          {title}
        </div>
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>);

}

function Choices({ value, options, onChange, wrap = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap: 8 }}>
      {options.map((o) => {
        const sel = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            flex: wrap ? '0 0 auto' : 1, padding: '10px 14px',
            borderRadius: 999, border: `1.5px solid ${sel ? '#FF6B35' : '#e5e5e5'}`,
            background: sel ? '#FF6B35' : '#fff',
            color: sel ? '#fff' : '#1a1a1a',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'all 120ms'
          }}>{o}</button>);

      })}
    </div>);

}

function SliderInput({ value, onChange, leftLabel, rightLabel }) {
  return (
    <div>
      <div style={{
        position: 'relative', height: 36, display: 'flex', alignItems: 'center'
      }}>
        <input type="range" min={1} max={5} step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{
          width: '100%', accentColor: '#FF6B35', height: 4
        }} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 2
      }}>
        <span>1 · {leftLabel}</span>
        <span style={{ fontWeight: 800, color: '#FF6B35', fontSize: 14 }}>{value}</span>
        <span>5 · {rightLabel}</span>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Admin panel (hidden — 5x logo tap)
// ─────────────────────────────────────────────────────────────
function AdminPanel({ onClose }) {
  const data = lsGet(LS_FEEDBACK, []);
  const [copied, setCopied] = useState(false);

  const copyJson = () => {
    const json = JSON.stringify(data, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      });
    } else {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = json;document.body.appendChild(ta);ta.select();
      try {document.execCommand('copy');} catch {}
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const reset = () => {
    if (confirm('清除所有回饋資料？')) {
      lsSet(LS_FEEDBACK, []);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: '#fff', display: 'flex', flexDirection: 'column'
    }}>
      {/* header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '60px 18px 14px', borderBottom: '1px solid #eee'
      }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 999, border: 'none',
          background: '#f2f2f2', cursor: 'pointer', fontSize: 18, fontWeight: 700
        }}>×</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            admin · feedback log
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>
            {data.length} 筆回饋
          </div>
        </div>
        <button onClick={copyJson} style={{
          padding: '8px 14px', height: 36, borderRadius: 999, border: 'none',
          background: copied ? '#22A06B' : '#FF6B35', color: '#fff', cursor: 'pointer',
          fontSize: 13, fontWeight: 700
        }}>{copied ? '已複製' : '複製為 JSON'}</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px 80px' }}>
        {data.length === 0 ?
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            還沒有回饋資料
          </div> :

        data.map((d, i) =>
        <div key={i} style={{
          border: '1px solid #eee', borderRadius: 12, padding: '12px 14px', marginBottom: 10,
          fontSize: 12, color: '#1a1a1a'
        }}>
              <div style={{ fontSize: 10, color: '#aaa', marginBottom: 6, fontFamily: 'ui-monospace, monospace' }}>
                #{i + 1} · {new Date(d.ts).toLocaleString('zh-TW')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '4px 10px', lineHeight: 1.5 }}>
                <span style={{ color: '#888' }}>繼續用</span><span>{d.continue_use}</span>
                <span style={{ color: '#888' }}>vs 替代品</span><span>{d.vs_alternatives}/5</span>
                <span style={{ color: '#888' }}>先打開</span><span>{d.first_open}</span>
                <span style={{ color: '#888' }}>新店嘗試</span><span>{d.tried_new}</span>
                <span style={{ color: '#888' }}>許願</span><span style={{ color: d.wishlist ? '#1a1a1a' : '#bbb' }}>{d.wishlist || '—'}</span>
              </div>
            </div>
        )
        }
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 28px', background: 'linear-gradient(to top, #fff 60%, rgba(255,255,255,0))'
      }}>
        <button onClick={reset} style={{
          width: '100%', height: 42, borderRadius: 12, border: '1px solid #FFD0D0',
          background: '#fff', color: '#FF4757', fontSize: 13, fontWeight: 700, cursor: 'pointer'
        }}>清除所有資料</button>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Toast — small confirmation when a like happens
// ─────────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)',
      background: '#1a1a1a', color: '#fff', fontSize: 13, fontWeight: 700,
      padding: '10px 18px', borderRadius: 999, zIndex: 150,
      boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
      animation: 'munch-toast 1600ms ease forwards'
    }}>{msg}</div>);

}

// ─────────────────────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────────────────────
function TopBar({ onLogoTap }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '60px 18px 12px', height: 96, boxSizing: 'border-box'
    }}>
      <div onClick={onLogoTap} style={{
        fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', color: '#1a1a1a',
        cursor: 'pointer', userSelect: 'none'
      }}>
        Munch<span style={{ color: '#FF6B35' }}>.</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={iconBtn}><Icon.Avatar /></button>
        <button style={iconBtn}><Icon.Menu /></button>
      </div>
    </div>);

}
const iconBtn = {
  width: 36, height: 36, borderRadius: 999, border: 'none', background: 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
function MunchApp() {
  const [showWelcome, setShowWelcome] = useState(() => !lsGet(LS_WELCOME, false));
  const [deck, setDeck] = useState(RESTAURANTS);
  const [swipedCount, setSwipedCount] = useState(() => lsGet(LS_SWIPED, 0));
  const [goTarget, setGoTarget] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackShown, setFeedbackShown] = useState(false); // shown for this session
  const [showAdmin, setShowAdmin] = useState(false);
  const [toast, setToast] = useState('');
  const logoTapsRef = useRef({ count: 0, last: 0 });

  const handleStart = () => {
    lsSet(LS_WELCOME, true);
    setShowWelcome(false);
  };

  const handleSwipe = (dir, r) => {
    const newCount = swipedCount + 1;
    setSwipedCount(newCount);
    lsSet(LS_SWIPED, newCount);
    setDeck((d) => d.slice(1));
    if (dir === 'right') {
      setToast(`已收藏「${r.name}」`);
      setTimeout(() => setToast(''), 1500);
    }
    // After 8 swipes, trigger feedback (once per page-load session)
    if (newCount === 8 && !feedbackShown) {
      setTimeout(() => {
        setShowFeedback(true);
        setFeedbackShown(true);
      }, 450);
    }
  };

  const handleGo = (r) => setGoTarget(r);
  const confirmGo = () => {
    console.log('[Munch] Navigating to:', goTarget && goTarget.name);
    setGoTarget(null);
  };

  const onLogoTap = () => {
    const now = Date.now();
    const t = logoTapsRef.current;
    if (now - t.last > 800) t.count = 0;
    t.count += 1;
    t.last = now;
    if (t.count >= 5) {
      t.count = 0;
      setShowAdmin(true);
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: '#F8F8F8', fontFamily: '"Noto Sans TC", -apple-system, system-ui, sans-serif',
      color: '#1a1a1a'
    }}>
      <TopBar onLogoTap={onLogoTap} />
      <div style={{
        position: 'absolute', top: 96, left: 0, right: 0, bottom: 34,
        display: 'flex', flexDirection: 'column'
      }}>
        <CardStack deck={deck} onSwipe={handleSwipe} onGo={handleGo} />
      </div>

      <Toast msg={toast} />
      {goTarget && <GoModal restaurant={goTarget} onCancel={() => setGoTarget(null)} onConfirm={confirmGo} />}
      {showFeedback && <FeedbackPanel onClose={() => setShowFeedback(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showWelcome && <Welcome onStart={handleStart} />}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// Mount inside iPhone frame
// ─────────────────────────────────────────────────────────────
function Root() {
  return (
    <div data-screen-label="Munch Prototype" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#EFEEEA', padding: '32px 16px'
    }}>
      <IOSDevice width={390} height={844}>
        <MunchApp />
      </IOSDevice>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);