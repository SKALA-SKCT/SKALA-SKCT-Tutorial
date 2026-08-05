import { useEffect, useState } from "react";
import { getCurrentUserName, logout as requestLogout } from "../api/auth";

const motherUrl = "https://www.skala-skct.com";
const mockUrl = "https://mock.skala-skct.com";
const practiceUrl = "https://practice.skala-skct.com";

export default function SiteHeader() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(import.meta.env.DEV ? "개발자" : null);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    getCurrentUserName()
      .then(setUserName)
      .catch(() => setUserName(null));
  }, []);

  const handleLogout = async () => {
    if (!import.meta.env.DEV) {
      await requestLogout().catch(() => undefined);
    }
    window.location.href = `${motherUrl}/login`;
  };

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="주요 서비스">
        <a className="brand-mark" href={motherUrl} aria-label="SKALA-SKCT 홈">
          <img src="https://mock.skala-skct.com/assets/sk-logo.svg" alt="SK" />
          <span>SKALA-SKCT</span>
        </a>

        <div className="site-tabs">
          <a href={motherUrl}>홈</a>
          <a href={mockUrl}>실전 모의고사</a>
          <a href={practiceUrl}>모의고사 문제 연습</a>
          <a className="active" href="/" aria-current="page">
            유형별 문제 연습
          </a>
        </div>

        <div className="site-account">
          {userName ? (
            <div
              className="account-menu"
              onMouseEnter={() => setAccountOpen(true)}
              onMouseLeave={() => setAccountOpen(false)}
            >
              <button
                className="account-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                {userName}님
              </button>
              <div className={`account-dropdown${accountOpen ? " open" : ""}`} role="menu">
                <div className="account-dropdown-panel">
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    로그아웃
                  </button>
                  <a href={`${motherUrl}/settings`} role="menuitem">
                    회원탈퇴
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <a className="account-button" href={`${motherUrl}/login`}>
              로그인
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
