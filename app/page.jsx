'use client';

import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PRESETS = [20000, 50000, 100000, 200000, 500000];
const formatNumber = value => new Intl.NumberFormat('vi-VN').format(value);
const formatMoney = value => `${formatNumber(value)}đ`;

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="topbar" id="home">
      <a className="brand" href="#home" aria-label="Mira World trang chủ">
        <span className="brand-mark">♡</span><span>Mira<span className="brand-star">✦</span><small>WORLD</small></span>
      </a>
      <nav className={`nav-links ${open ? 'is-open' : ''}`} id="navLinks" aria-label="Điều hướng chính">
        <a onClick={close} className="nav-active" href="#home">Trang chủ</a>
        <a onClick={close} href="#donate">Ủng hộ Mira</a>
        <a onClick={close} href="#ranking">Bảng xếp hạng</a>
        <a onClick={close} href="#about">Thông tin</a>
      </nav>
      <div className="header-actions"><span className="live-chip"><span className="pulse-dot" />Always grateful</span><a className="header-cta" href="#donate">Gửi yêu thương <span>↗</span></a></div>
      <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-controls="navLinks" aria-expanded={open} aria-label={open ? 'Đóng menu' : 'Mở menu'}>{open ? '✕' : '☰'}</button>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="heroTitle">
      <div className="floating floating-left" aria-hidden="true">✳</div><div className="floating floating-right" aria-hidden="true">♡</div>
      <div className="eyebrow"><span className="eyebrow-sparkle">✦</span> WELCOME TO MY LITTLE UNIVERSE <span className="eyebrow-sparkle">✦</span></div>
      <h1 id="heroTitle">Một chút <em>dịu dàng,</em><br />một thế giới <span>yêu thương.</span></h1>
      <p>Chào mừng bạn đến với góc nhỏ của Mira — nơi những lời chúc ngọt ngào<br className="desktop-break" /> biến mỗi ngày bình thường thành một ngày thật đặc biệt. ✨</p>
      <div className="hero-scroll"><span className="hero-scroll-icon">↓</span> Gửi một chút yêu thương ở bên dưới</div>
    </section>
  );
}

function ProfileSidebar({ wishes, wishesLoading, wishesError }) {
  return (
    <aside className="side-column profile-column" id="about">
      <section className="card creator-card">
        <div className="cover-art" aria-hidden="true"><span className="cover-cloud cloud-a" /><span className="cover-cloud cloud-b" /><span className="cover-star star-a">✧</span><span className="cover-star star-b">✦</span><span className="cover-moon">☾</span><span className="cover-text">little dreams<br/>big magic</span></div>
        <div className="creator-avatar" role="img" aria-label="Ảnh đại diện minh họa của Mira"><span>♡</span><span className="avatar-face">◕‿◕</span></div>
        <div className="creator-content"><div className="creator-title-row"><h2>Mira <span className="verified">✦</span></h2><span className="creator-status"><i /> Creator</span></div>
          <p className="creator-handle">@mira · welcome to my world</p>
          <p className="creator-bio">Mình là Mira! Mình thích những điều nhỏ xinh, những câu chuyện ấm áp và tất cả mọi người ở đây. Cảm ơn bạn đã ghé thăm! 💜</p>
          <div className="divider-soft" />
          <div className="creator-metrics"><div><strong>∞</strong><small>yêu thương</small></div><div><strong>♡</strong><small>năng lượng</small></div><div><strong>✦</strong><small>niềm vui</small></div></div>
          <a href="#donate" className="profile-button">Gửi Mira một chiếc ôm <span>↗</span></a>
        </div>
      </section>
      <section className="card ranking-card" id="ranking" aria-live="polite">
        <div className="section-heading"><span className="heading-icon">💌</span><div><h3>Lời chúc gần đây</h3><p>Những điều dễ thương đã được gửi</p></div><span className="week-tag">Mới nhất</span></div>
        {wishesError && <p className="wish-list-error">{wishesError}</p>}
        {wishesLoading && !wishesError && <p className="wish-list-info">Đang tải lời chúc…</p>}
        {!wishesLoading && !wishesError && wishes.length === 0 && <div className="empty-ranking"><div className="ranking-illustration"><span>♡</span><span>✦</span><span>♡</span></div><strong>Chưa có lời chúc nào</strong><p>Hãy là người đầu tiên gửi một lời chúc thật dễ thương nhé!</p></div>}
        {wishes.length > 0 && <div className="wish-list">{wishes.map(wish => <article className="wish-item" key={wish.id}><div className="wish-item-title"><span>♡</span><strong>{wish.name}</strong></div><p>{wish.message}</p></article>)}</div>}
      </section>
    </aside>
  );
}

function DonationForm() {
  const [amount, setAmount] = useState(50000);
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('Chúc Mira livestream thật vui nha! 💗');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const amountRef = useRef(null);

  const displayName = anonymous ? 'Ẩn danh' : name.trim() || 'Một người bạn dễ thương';
  const displayMessage = message.trim() || 'Gửi Mira thật nhiều yêu thương ♡';
  const changeStep = target => {
    setStep(target);
    document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const next = () => {
    if (amount < 10000) {
      setError('Vui lòng chọn số tiền từ 10.000đ trở lên.');
      amountRef.current?.focus();
      return;
    }
    if (!message.trim()) {
      setError('Vui lòng nhập lời chúc trước khi tiếp tục.');
      return;
    }
    setError('');
    changeStep(2);
  };
  const setPreset = value => {
    setError('');
    if (value === 'custom') {
      amountRef.current?.focus();
      amountRef.current?.select();
      return;
    }
    setAmount(value);
  };
  const saveWish = async () => {
    if (saving) return;
    if (!db) {
      setError('Chưa cấu hình Firebase. Hãy kiểm tra file .env.local rồi build lại web.');
      return;
    }
    const text = message.trim();
    if (!text || text.length > 255) {
      setError('Lời chúc phải có từ 1 đến 255 ký tự.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Chỉ ghi lời chúc; số tiền và email KHÔNG phải là giao dịch hay thông tin thanh toán.
      await addDoc(collection(db, 'wishes'), {
        name: displayName,
        message: text,
        anonymous,
        createdAt: serverTimestamp(),
      });
      changeStep(3);
    } catch (e) {
      console.error('Lỗi lưu lời chúc:', e);
      setError('Không thể lưu lời chúc. Vui lòng thử lại hoặc kiểm tra quyền Firestore.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="card donation-card" id="donate" aria-labelledby="donateTitle">
      <div className="donation-heading"><div><span className="overline">GÓC NHỎ YÊU THƯƠNG</span><h2 id="donateTitle">Gửi Mira một chiếc ôm <span>♡</span></h2><p>Một lời nhắn nhỏ, một niềm vui to.</p></div><div className="donation-heading-icon">💌</div></div>
      <div className="stepper" aria-label="Các bước ủng hộ">
        {[1, 2, 3].map((s, i) => (
          <div key={s} style={{display:'contents'}}>
            {i > 0 && <div className="step-line" aria-hidden="true" />}
            <div className={`step-item ${s === step ? 'is-current' : ''} ${s < step ? 'is-done' : ''}`}>
              <span className="step-dot">{s < step ? '✓' : s}</span><span>{['Thông tin', 'Thanh toán', 'Hoàn tất'][i]}</span>
            </div>
          </div>
        ))}
      </div>

      {step === 1 && <div className="step-panel">
        <div className="field-top"><label htmlFor="amount">Số tiền ủng hộ <span className="required">*</span></label><span className="hint">Tối thiểu 10.000đ</span></div>
        <div className="amount-input-wrap"><span className="amount-symbol">₫</span><input ref={amountRef} id="amount" type="text" inputMode="numeric" autoComplete="off" value={amount ? formatNumber(amount) : ''} aria-describedby="amountError" onChange={e => { setAmount(Number(e.target.value.replace(/\D/g, '')) || 0); setError(''); }} /><span className="amount-suffix">VND</span></div>
        <p className="error-message" id="amountError" role="alert">{error}</p>
        <div className="amount-presets" role="group" aria-label="Chọn mức ủng hộ">
          {PRESETS.map(p => <button type="button" key={p} aria-pressed={p === amount} className={p === amount ? 'is-selected' : ''} onClick={() => setPreset(p)}>{formatMoney(p)} {p === 50000 && <span>♥</span>}</button>)}
          <button type="button" aria-pressed={!PRESETS.includes(amount)} className={!PRESETS.includes(amount) ? 'is-selected' : ''} onClick={() => setPreset('custom')}>Số khác <span>↗</span></button>
        </div>
        <div className="field-divider" />
        <div className="field-top"><label htmlFor="displayName">Tên hiển thị trên live</label><label className="toggle-label"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} /><span className="toggle-track"><span /></span><span>Ẩn danh</span></label></div>
        <input className="text-input" type="text" id="displayName" maxLength={50} placeholder={anonymous ? 'Bạn sẽ được hiển thị là Ẩn danh' : 'Mọi người gọi bạn là gì?'} autoComplete="name" disabled={anonymous} value={name} onChange={e=>setName(e.target.value)} />
        <button type="button" className="subtle-link" onClick={() => setShowEmail(!showEmail)}>{showEmail ? '− Ẩn email' : '＋ Thêm email'} <span>(không bắt buộc)</span></button>
        {showEmail && <div className="email-field"><label htmlFor="email">Email liên hệ (tùy chọn)</label><input className="text-input" type="email" id="email" placeholder="email@vi-du.com" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>}
        <div className="field-top message-label"><label htmlFor="message">Lời nhắn gửi Mira <span className="pink-heart">♡</span></label><span className="hint">{Array.from(message).length}/255 ký tự</span></div>
        <textarea id="message" maxLength={255} rows={4} placeholder="Viết điều gì đó thật dễ thương nhé..." value={message} onChange={e=>setMessage(e.target.value)} />
        <div className="wish-card"><span className="wish-icon">✨</span><div><strong>Điều ước nhỏ của Mira</strong><p>Được gặp thêm nhiều trái tim dịu dàng và cùng nhau tạo nên những kỷ niệm thật đẹp.</p></div></div>
        <button type="button" className="primary-button" onClick={next}>Tiếp tục gửi yêu thương <span>↗</span></button>
        <p className="form-footnote">🔒 Chỉ lưu tên và lời chúc công khai. Không lưu email hoặc xác nhận thanh toán.</p>
      </div>}

      {step === 2 && <div className="step-panel">
        <div className="payment-intro"><span>💜</span><h3>Chỉ một bước nữa thôi!</h3><p>Xem lại lời nhắn trước khi tiếp tục nhé.</p></div>
        <div className="summary-card"><div><span>Người gửi</span><strong>{displayName}</strong></div><div><span>Số tiền ủng hộ</span><strong>{formatMoney(amount)}</strong></div><div className="summary-note"><span>Lời nhắn</span><p>{displayMessage}</p></div></div>
        <div className="demo-payment"><div className="demo-payment-symbol">♡</div><h4>Lưu lời chúc trên Firebase</h4><p>Lời chúc sẽ được lưu công khai. Số tiền chỉ mang tính minh họa, không có bất kỳ khoản thanh toán nào được thực hiện.</p><span className="demo-pill">LƯU LỜI CHÚC · KHÔNG THU TIỀN</span></div>
        <div className="button-row"><button type="button" className="secondary-button" onClick={() => changeStep(1)}>← Quay lại</button><button type="button" className="primary-button" disabled={saving} onClick={saveWish}>{saving ? 'Đang lưu lời chúc…' : 'Gửi và lưu lời chúc ♡'}</button></div>
        {error && <p className="error-message" role="alert">{error}</p>}
      </div>}

      {step === 3 && <div className="step-panel"><div className="success-bloom">♡<span>✦</span></div><span className="overline success-overline">ONE LITTLE ACT OF LOVE</span><h3 className="success-title">Lời chúc đã được lưu thành công! ♡</h3><p className="success-description">Cảm ơn bạn! Lời chúc đã được lưu vào Cloud Firestore và sẽ xuất hiện trong danh sách gần đây. Không có khoản thanh toán nào được thực hiện.</p><div className="summary-card success-summary"><div><span>Tên hiển thị</span><strong>{displayName}</strong></div><div className="summary-note"><span>Lời chúc</span><p>{displayMessage}</p></div></div><button type="button" className="primary-button" onClick={() => {setMessage(''); setName(''); setAnonymous(false); changeStep(1);}}>Viết lời nhắn mới <span>↗</span></button></div>}
    </section>
  );
}

function ExtrasSidebar() {
  return (
    <aside className="side-column extras-column">
      <section className="love-card"><div className="love-card-sparkles" aria-hidden="true">✧ <span>✳</span> ♡</div><div className="love-illustration" aria-hidden="true"><span className="planet-ring" /><span className="love-planet">♡</span><span className="heart-spark heart-spark-1">✦</span><span className="heart-spark heart-spark-2">✧</span></div><span className="love-eyebrow">A NOTE FROM MIRA</span><h3>Ở đây, bạn luôn<br />được <em>yêu thương.</em></h3><p>Chỉ cần bạn ghé qua, thế giới nhỏ này đã trở nên đáng yêu hơn rất nhiều rồi.</p><div className="love-signature">with love, Mira ♡</div></section>
      <section className="card benefits-card"><div className="section-heading benefits-heading"><span className="heading-icon">💗</span><div><h3>Tại sao ủng hộ Mira?</h3><p>Mỗi món quà đều ý nghĩa</p></div></div><div className="benefit-item"><span className="benefit-icon gem">💎</span><div><strong>Tiếp thêm động lực</strong><p>Cho những buổi livestream đầy cảm hứng.</p></div></div><div className="benefit-item"><span className="benefit-icon shine">🌟</span><div><strong>Gửi lời nhắn đặc biệt</strong><p>Lưu lại những lời chúc ngọt ngào.</p></div></div><div className="benefit-item"><span className="benefit-icon bow">🎀</span><div><strong>Cùng tạo kỷ niệm</strong><p>Biến khoảnh khắc nhỏ thành điều đáng nhớ.</p></div></div></section>
      <div className="mini-quote"><span>✦</span> together, we make beautiful moments <span>✦</span></div>
    </aside>
  );
}

export default function Home() {
  const [wishes, setWishes] = useState([]);
  const [wishesLoading, setWishesLoading] = useState(true);
  const [wishesError, setWishesError] = useState('');

  useEffect(() => {
    if (!db) {
      setWishesError('Firebase chưa được cấu hình.');
      setWishesLoading(false);
      return;
    }
    const recentWishes = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'), limit(8));
    const unsubscribe = onSnapshot(recentWishes, snapshot => {
      setWishes(snapshot.docs.map(item => ({ id: item.id, ...item.data() })));
      setWishesLoading(false);
      setWishesError('');
    }, error => {
      console.error('Không thể tải lời chúc:', error);
      setWishesError('Không thể tải lời chúc. Vui lòng kiểm tra quyền Firestore.');
      setWishesLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return <><div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
    <div className="site-wrap"><Header /><main><Hero />
      <section className="main-grid" aria-label="Không gian của Mira"><ProfileSidebar wishes={wishes} wishesLoading={wishesLoading} wishesError={wishesError} /><DonationForm /><ExtrasSidebar /></section>
      <section className="bottom-banner"><span>✳</span><div><strong>Thế giới đẹp hơn nhờ những điều tử tế.</strong><p>Thank you for being part of this little universe ♡</p></div><span>♡</span></section>
    </main><footer className="footer"><a className="footer-brand" href="#home">✦ Mira World ♡</a><span>Made with love, a little stardust and lots of heart.</span><span>© 2026 Mira World · Demo UI</span></footer></div>
  </>;
}
