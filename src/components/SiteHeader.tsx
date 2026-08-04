import { useEffect, useState } from "react";

const motherUrl = "https://www.skala-skct.com";
const mockUrl = "https://mock.skala-skct.com";
const practiceUrl = "https://practice.skala-skct.com";

function isUserResponse(value: unknown): value is { nick?: string; nickname?: string } {
  if (typeof value !== "object" || value === null) return false;
  return (
    ("nick" in value && (typeof value.nick === "string" || value.nick === undefined)) ||
    ("nickname" in value && (typeof value.nickname === "string" || value.nickname === undefined))
  );
}

export default function SiteHeader() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(import.meta.env.DEV ? "개발자" : null);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const user: unknown = await response.json();
        setUserName(isUserResponse(user) ? (user.nick ?? user.nickname ?? null) : null);
      })
      .catch(() => setUserName(null));
  }, []);

  const logout = async () => {
    if (!import.meta.env.DEV) {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
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
                  <button type="button" role="menuitem" onClick={logout}>
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
