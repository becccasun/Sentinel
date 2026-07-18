const COLUMNS = [
  {
    title: null,
    links: [
      'About us',
      'Careers',
      'Emerging talent',
      'Customers',
      'Help center',
      'Product releases',
      'Ramp Agent for Cards',
      'Ramp Labs',
      'API documentation',
      'Versus',
    ],
  },
  {
    title: 'Products',
    links: [
      'Corporate cards',
      'Expense management',
      'Spend management',
      'Budgets',
      'Treasury',
      'Travel',
      'Reimbursements',
      'Procurement',
      'Accounts payable',
      'Vendor management',
      'Approvals',
      'Security',
      'Trust',
      'Bank connections',
      'Mobile app',
      'Ramp Sheets',
    ],
  },
  {
    title: 'Platform',
    links: [
      'Platform overview',
      'Accounting automation',
      'Intelligence',
      'Reporting',
      'Savings',
      'Integrations',
      'Multi-entity',
      'Global',
      'AI Spend Intelligence',
    ],
  },
  {
    title: 'Partners',
    links: [
      'Accounting firms',
      'Private equity',
      'Venture capital',
      'Tech services partners',
      'Technology partners',
      'Spend and payroll partners',
      'Reseller partners',
      'Franchise partners',
    ],
  },
  {
    title: 'Solutions',
    links: ['Startups', 'Small business', 'Mid market', 'Enterprise'],
  },
  {
    title: 'Free tools and resources',
    links: [
      'Perks and rewards',
      'Find an accountant',
      'Find a services partner',
      'Savings calculator',
      'Mission statement generator',
      'Charge finder',
      'Per diem calculator',
      'Mileage reimbursement calculator',
      'Card comparison tool',
      'Investor database',
      'Expense categorization',
      'Vendor directory',
      'Virtual cards',
      'Answers Hub',
    ],
  },
];

const LEGAL_LINKS = ['Terms of Service', 'Editorial Guidelines', 'Privacy Policy', 'Your Privacy Choices'];

const FINE_PRINT = [
  '© 2026 Ramp Business Corporation. “Ramp” and the Ramp logo are registered trademarks of the company.',
  'Ramp Support: +1-855-206-7283',
  'The Ramp Visa Corporate Card is issued in the U.S. by Celtic Bank, and to U.S. corporations operating globally by Column N.A., Member FDIC, and is subject to credit approval. The Ramp Visa Commercial Card is issued by Sutton Bank, Member FDIC. The Ramp Visa Business Card is issued by Lead Bank, Member FDIC. Each card is issued pursuant to a license from Visa USA Inc.',
  'Ramp cards are issued in Canada by Peoples Trust Company, pursuant to license by *Visa International. Visa Int./Peoples Trust Company, Licensed User.',
  'Visa is a registered trademark of Visa International Service Association. All other trademarks and service marks belong to their respective owners.',
  '*Ramp Business Corporation is a financial technology company and is not a bank. Bank deposit services provided by First Internet Bank of Indiana, Member FDIC.',
  'Ramp Payments Corporation – NMLS 2371465 Disclosures, Ramp Financing Corporation – NMLS 2431387',
];

function RampMark() {
  return (
    <svg className="email-cta__mark" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 12 L7 2 L9.5 7 L12 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmailCta() {
  return (
    <form className="email-cta" onSubmit={(e) => e.preventDefault()}>
      <input type="email" placeholder="What’s your work email?" aria-label="Work email" />
      <RampMark />
      <button type="submit" className="btn btn--primary email-cta__btn">
        Get started for free
      </button>
    </form>
  );
}

export default function Footer() {
  return (
    <>
      <section className="cta-band">
        <h2 className="cta-band__title">Time is money. Save both.</h2>
        <EmailCta />
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <nav className="footer__cols" aria-label="Footer">
            {COLUMNS.map((col) => (
              <div className="footer__col" key={col.title ?? 'company'}>
                {col.title && <div className="footer__col-title">{col.title}</div>}
                <ul>
                  {col.links.map((label) => (
                    <li key={label}>
                      <a href="#">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <hr className="footer__rule" />

          <div className="footer__legal">
            <div className="footer__fineprint">
              <div className="footer__legal-links">
                {LEGAL_LINKS.map((label) => (
                  <a href="#" key={label}>
                    {label}
                  </a>
                ))}
              </div>
              {FINE_PRINT.map((text) => (
                <p key={text.slice(0, 24)}>{text}</p>
              ))}
            </div>

            <address className="footer__address">
              Ramp Business Corporation
              <br />
              28 West 23rd Street, Floor 2
              <br />
              New York, NY 10010
            </address>

            <div className="footer__meta">
              <div className="footer__stores">
                <a href="#" className="store-badge">App Store</a>
                <a href="#" className="store-badge">Google Play</a>
              </div>
              <div className="footer__socials">
                <a href="#">LinkedIn</a>
                <a href="#">X</a>
                <a href="#">Facebook</a>
              </div>
            </div>
          </div>

          <div className="footer__signup">
            <p>
              Join the <strong>50,000+ businesses</strong> simplifying their finances with Ramp.
            </p>
            <EmailCta />
          </div>
        </div>
      </footer>
    </>
  );
}
