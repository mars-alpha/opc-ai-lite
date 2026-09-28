export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-bar footer-bar-minimal">
        <div className="brand footer-brand">
          <img src="/opc-logo.png" alt="" aria-hidden="true" />
          <span>OPC AI</span>
        </div>
        <small>
          © 2026 OPC AI · 持续更新你的 AI 能力 ·{" "}
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
            粤ICP备2026146983号
          </a>
        </small>
      </div>
    </footer>
  );
}
