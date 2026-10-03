import { CalculatorId } from '../types/financial';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  proTip?: string;
  tag?: string;
}

export interface CalculatorFaqData {
  calculatorId: CalculatorId | 'directory';
  title: string;
  subtitle: string;
  items: FaqItem[];
}

export const CALCULATOR_FAQS: Record<CalculatorId | 'directory', CalculatorFaqData> = {
  mortgage: {
    calculatorId: 'mortgage',
    title: 'Mortgage & Home Financing FAQ',
    subtitle: 'Key strategies, lending formulas, and actionable tips for home buyers.',
    items: [
      {
        id: 'mortgage-1',
        tag: 'Affordability',
        question: 'How much house can I realistically afford to buy?',
        answer:
          'Lenders generally apply the 28/36 debt-to-income (DTI) rule. Your total housing costs (principal, interest, taxes, and insurance) should not exceed 28% of your gross monthly income (front-end ratio). Furthermore, your total debt obligations (housing + car loans + student debt + credit cards) should remain under 36% of your gross monthly income (back-end ratio).',
        proTip: 'Aim for a 25% front-end ratio if you want breathing room for lifestyle expenses, home maintenance, and consistent emergency fund savings.',
      },
      {
        id: 'mortgage-2',
        tag: 'PMI & Down Payment',
        question: 'What is Private Mortgage Insurance (PMI) and when can I cancel it?',
        answer:
          'If your down payment is less than 20% on a conventional loan, lenders require Private Mortgage Insurance (PMI) to protect against default. Under the Homeowners Protection Act, you have the legal right to request PMI cancellation when your principal balance reaches 80% of the original home value, and lenders must automatically cancel it at 78% Loan-to-Value (LTV).',
        proTip: 'If your local real estate market has appreciated substantially, you can pay for a new certified appraisal to prove your equity exceeds 20% and request early PMI removal.',
      },
      {
        id: 'mortgage-3',
        tag: 'Loan Term',
        question: 'Should I choose a 15-year or a 30-year fixed mortgage?',
        answer:
          'A 15-year mortgage comes with a lower interest rate (typically 0.5%–0.8% lower) and saves tens of thousands in interest, but requires roughly 30%–45% higher monthly payments. A 30-year loan offers flexibility: lower mandatory monthly obligations, which shields you during unexpected income drops.',
        proTip: 'A popular strategy is taking a 30-year fixed loan for payment safety, but voluntarily paying extra principal every month as if it were a 15-year mortgage. You get the interest savings without the strict contractual risk.',
      },
      {
        id: 'mortgage-4',
        tag: 'Escrow & Hidden Costs',
        question: 'What expenses are included in PITI and Escrow?',
        answer:
          'PITI stands for Principal, Interest, Taxes, and Insurance. Most mortgage lenders collect property taxes and homeowners insurance monthly alongside your loan payment and hold them in an escrow account, paying the city and insurer on your behalf when due.',
        proTip: 'Always budget an additional 1% to 2% of the home purchase price annually for ongoing repair, maintenance, and appliance replacements.',
      },
    ],
  },

  loan: {
    calculatorId: 'loan',
    title: 'Personal Loan & Debt FAQ',
    subtitle: 'Understanding interest mechanics, compounding, and smart debt elimination.',
    items: [
      {
        id: 'loan-1',
        tag: 'APR vs Rate',
        question: 'What is the true difference between Interest Rate and APR?',
        answer:
          'The interest rate is the baseline cost of borrowing the principal balance per year. The Annual Percentage Rate (APR) includes both the interest rate AND mandatory upfront fees, such as origination fees or processing charges. APR reflects the actual true cost of credit.',
        proTip: 'When comparing loans across different banks, always compare the APR rather than the nominal interest rate.',
      },
      {
        id: 'loan-2',
        tag: 'Payment Frequency',
        question: 'Does paying bi-weekly instead of monthly actually save money?',
        answer:
          'Yes! When paying bi-weekly (every two weeks), you make 26 half-payments per calendar year. This equals 13 full monthly payments instead of 12. That extra month of principal payment each year directly lowers your balance and compounds into significant interest savings.',
        proTip: 'Check with your lender first to ensure they credit bi-weekly payments immediately toward principal rather than holding them until the end of the month.',
      },
      {
        id: 'loan-3',
        tag: 'Payoff Strategy',
        question: 'Should I use the Debt Avalanche or Debt Snowball method?',
        answer:
          'The Debt Avalanche method pays off debts in order of highest interest rate first, mathematically saving the most money. The Debt Snowball method pays the smallest balance first regardless of interest, delivering quick psychological wins and momentum.',
        proTip: 'If you struggle with financial motivation, choose the Snowball method. If you are disciplined and want minimum total cost, choose the Avalanche method.',
      },
    ],
  },

  investment: {
    calculatorId: 'investment',
    title: 'Compound Interest & Investing FAQ',
    subtitle: 'How exponential growth transforms regular contributions into generational wealth.',
    items: [
      {
        id: 'inv-1',
        tag: 'Compound Growth',
        question: 'Why is compound interest called exponential growth?',
        answer:
          'Simple interest only earns money on the initial principal. Compound interest earns returns on both your principal AND previously accumulated returns. Over 20–30 years, the earned interest will far surpass your actual out-of-pocket contributions.',
        proTip: 'The Rule of 72: Divide 72 by your annual expected return percentage to estimate how many years it will take your investment to double (e.g., at 8% return, 72 / 8 = 9 years to double).',
      },
      {
        id: 'inv-2',
        tag: 'Deposit Timing',
        question: 'Is it better to invest a lump sum or use Dollar-Cost Averaging (DCA)?',
        answer:
          'Historically, investing a lump sum beats dollar-cost averaging about 66% of the time because markets trend upward over long periods. However, DCA (investing regular monthly deposits) prevents emotional mistakes and eliminates the fear of buying at market peaks.',
        proTip: 'Automate your monthly deposit immediately after your payday so investing happens effortlessly before discretionary spending occurs.',
      },
      {
        id: 'inv-3',
        tag: 'Asset Returns',
        question: 'What is a realistic long-term annual return expectation?',
        answer:
          'Historically, broad stock market indices like the S&P 500 have generated approximately 9.5% to 10.5% nominal annual returns before inflation over multidecade spans (~7% after inflation). Conservative bond portfolios typically yield 3% to 5%.',
        proTip: 'When modeling 20+ year projections, using a conservative 6.5% to 7.5% expected return accounts for inflation and market variability.',
      },
    ],
  },

  'auto-loan': {
    calculatorId: 'auto-loan',
    title: 'Auto Financing & Trade-In FAQ',
    subtitle: 'Avoid predatory auto financing terms and minimize depreciation loss.',
    items: [
      {
        id: 'auto-1',
        tag: 'Golden Rule',
        question: 'What is the 20/4/10 rule for vehicle purchases?',
        answer:
          'Financial experts recommend: 1) Put down at least 20% in cash or trade-in equity, 2) Finance the vehicle for no longer than 4 years (48 months), and 3) Keep total vehicle expenses (loan + insurance + fuel) under 10% of your gross monthly income.',
        proTip: 'Putting 20% down prevents you from becoming "underwater" (owing more on the loan than the vehicle is worth) as soon as you drive off the dealer lot.',
      },
      {
        id: 'auto-2',
        tag: 'Trade-in & Tax',
        question: 'How does trading in a car save money on sales tax?',
        answer:
          'In many jurisdictions, state or provincial sales tax is calculated only on the difference between the new car price and your trade-in allowance. For example, if buying a $30,000 vehicle and trading in a $10,000 car with 8% sales tax, you only pay tax on the remaining $20,000—saving $800 in tax!',
        proTip: 'Always negotiate the new car purchase price and your trade-in value as two separate transactions so the dealer cannot camouflage numbers.',
      },
      {
        id: 'auto-3',
        tag: 'Loan Terms',
        question: 'Why should I be cautious of 72 or 84-month car loans?',
        answer:
          'While 6-year and 7-year loans lower your monthly payment, cars depreciate rapidly (often losing 40%–50% of value in 3 years). With a long loan, you will remain in negative equity for years, and you pay substantially higher total interest.',
        proTip: 'If you can only afford a vehicle by stretching the financing to 72 or 84 months, that vehicle is too expensive for your current budget.',
      },
    ],
  },

  retirement: {
    calculatorId: 'retirement',
    title: '401(k) & Retirement Planning FAQ',
    subtitle: 'Maximize employer matches, tax advantages, and sustainable retirement withdrawals.',
    items: [
      {
        id: 'ret-1',
        tag: 'Employer Match',
        question: 'Why is an employer 401(k) match considered "free money"?',
        answer:
          'If your employer offers a 50% match on contributions up to 6% of your salary, contributing that 6% provides an immediate, risk-free 50% return on your money before your investments even begin growing. Never leave an employer match unclaimed.',
        proTip: 'Even if you are aggressively paying down other debts, prioritize contributing enough to your 401(k) to secure 100% of your employer match first.',
      },
      {
        id: 'ret-2',
        tag: 'Withdrawals',
        question: 'What is the 4% Safe Withdrawal Rule?',
        answer:
          'Originating from the Trinity Study, the 4% rule states that if you withdraw 4% of your total retirement portfolio in year one, and adjust that dollar figure for inflation each subsequent year, your nest egg has a 95%+ probability of lasting at least 30 years.',
        proTip: 'To determine your target retirement nest egg, multiply your anticipated annual living expenses by 25 (e.g., $60,000/year × 25 = $1,500,000 target).',
      },
      {
        id: 'ret-3',
        tag: 'Traditional vs Roth',
        question: 'Should I contribute to a Traditional 401(k) or a Roth 401(k)?',
        answer:
          'Traditional contributions are made pre-tax (reducing your taxes today), but withdrawals in retirement are taxed as ordinary income. Roth contributions are made with after-tax dollars today, but all future growth and withdrawals in retirement are 100% tax-free.',
        proTip: 'If you are early in your career or expect to be in a higher tax bracket in retirement, Roth is generally superior. If you are currently in peak earning years in a high tax bracket, Traditional offers immediate tax relief.',
      },
    ],
  },

  amortization: {
    calculatorId: 'amortization',
    title: 'Extra Principal & Amortization FAQ',
    subtitle: 'How extra payments bypass interest compounding and accelerate debt freedom.',
    items: [
      {
        id: 'amort-1',
        tag: 'Principal Direct',
        question: 'How does an extra payment directly reduce mortgage interest?',
        answer:
          'In standard amortized loans, interest is recalculated every month based strictly on the remaining principal balance. When you pay extra toward the principal, that money immediately reduces the baseline for all future interest calculations across every remaining year.',
        proTip: 'Specify to your lender or mortgage servicer that extra funds must be applied to "Principal Reduction Only", not toward future monthly payments.',
      },
      {
        id: 'amort-2',
        tag: 'Impact',
        question: 'How much time can an extra $200 per month save on a 30-year loan?',
        answer:
          'On a typical $300,000 mortgage at 6.5% interest, adding just $200 per month to your regular payment will eliminate roughly 6 to 7 years from your mortgage and save over $85,000 in interest payments!',
        proTip: 'Use any annual bonuses, tax refunds, or unexpected windfalls as lump-sum principal paydowns to achieve rapid reductions in your amortization schedule.',
      },
      {
        id: 'amort-3',
        tag: 'Payoff vs Invest',
        question: 'Is it better to pay off a mortgage early or invest excess cash?',
        answer:
          'Paying off debt yields a guaranteed return equal to the loan interest rate (e.g., a guaranteed 6.5% return). Investing in an index fund historically yields ~9%-10% long-term, but carries market risk and volatility.',
        proTip: 'Compare your mortgage interest rate to safe risk-free yields: if your mortgage rate is above 6%, paying down principal is hard to beat on a risk-adjusted basis.',
      },
    ],
  },

  inflation: {
    calculatorId: 'inflation',
    title: 'Inflation & Purchasing Power FAQ',
    subtitle: 'Protect your savings and understand the erosive effects of consumer price inflation.',
    items: [
      {
        id: 'inf-1',
        tag: 'Purchasing Power',
        question: 'Why is holding excess cash considered a guaranteed loss over time?',
        answer:
          'At a moderate 3.2% annual inflation rate, prices double roughly every 22 years. A $100,000 cash balance in a 0% interest account will only purchase about $50,000 worth of real goods and services two decades later.',
        proTip: 'Keep 3 to 6 months of living expenses in an emergency fund inside a High-Yield Savings Account (HYSA) or money market fund, and invest the rest in growth assets.',
      },
      {
        id: 'inf-2',
        tag: 'Inflation Hedges',
        question: 'Which asset classes have historically outpaced inflation?',
        answer:
          'Productive assets like equity shares in profitable businesses (stocks) and physical real estate have historically provided the best long-term hedge against inflation, as corporate earnings and rental rates adjust upward with price levels.',
        proTip: 'Treasury Inflation-Protected Securities (TIPS) and Series I Savings Bonds provide explicit government guarantees tied directly to the Consumer Price Index (CPI).',
      },
      {
        id: 'inf-3',
        tag: 'Borrowing',
        question: 'Does inflation actually help or hurt borrowers with fixed-rate loans?',
        answer:
          'Inflation significantly benefits borrowers with long-term fixed-rate loans (like a 30-year fixed mortgage). As wages and general prices rise with inflation, the borrower pays back the loan with "cheaper", less valuable currency, while the payment amount remains frozen.',
        proTip: 'Never rush to pay off low fixed-interest debt (e.g., mortgages locked in at 2.5% to 3.5%) during high inflation periods, as inflation actively erodes the real value of the debt.',
      },
    ],
  },

  salary: {
    calculatorId: 'salary',
    title: 'Salary & Take-Home Pay FAQ',
    subtitle: 'Navigate tax brackets, deductions, and accurate hourly vs. salary conversions.',
    items: [
      {
        id: 'sal-1',
        tag: 'Taxes',
        question: 'What is the difference between Marginal Tax Rate and Effective Tax Rate?',
        answer:
          'Your marginal tax rate is the percentage of tax paid on your highest dollar of income (your top tax bracket). Your effective tax rate is the actual percentage of your total income paid in taxes. Because tax brackets are progressive, your effective tax rate is always lower than your marginal bracket.',
        proTip: 'Getting a pay raise will never result in taking home less money due to moving into a higher tax bracket; only the dollars earned within the higher bracket are taxed at the higher rate.',
      },
      {
        id: 'sal-2',
        tag: 'Pre-tax Deductions',
        question: 'How do pre-tax deductions increase my take-home efficiency?',
        answer:
          'Contributions to traditional 401(k) accounts, Health Savings Accounts (HSAs), and Flexible Spending Accounts (FSAs) come directly out of your gross paycheck before income taxes are calculated, lowering your overall taxable income.',
        proTip: 'An HSA is the only triple-tax-advantaged account available: contributions are tax-deductible, investments grow tax-free, and withdrawals for qualified medical expenses are 100% tax-free.',
      },
      {
        id: 'sal-3',
        tag: 'Hourly vs Salary',
        question: 'How do I convert an hourly wage into an annual salary?',
        answer:
          'Standard full-time employment consists of 40 hours per week across 52 weeks in a year, equaling 2,080 working hours. A quick rule of thumb: double the hourly rate and multiply by 1,000 (e.g., $35/hour × 2,000 ≈ $70,000/year).',
        proTip: 'Always factor in benefits (health insurance, 401k match, paid time off, and bonuses) which usually add an extra 20% to 30% of total compensation value on top of base salary.',
      },
    ],
  },

  directory: {
    calculatorId: 'directory',
    title: 'SmartFinCalc Platform & US Financial Methodology FAQ',
    subtitle: 'Transparent, client-side, actuarially sound US financial modeling.',
    items: [
      {
        id: 'dir-1',
        tag: 'Privacy & Security',
        question: 'Are my personal financial inputs saved or transmitted to a server?',
        answer:
          'No. SmartFinCalc.com operates entirely client-side inside your web browser. All calculations, amortization schedules, and comparison models run securely on your local device. We never store, transmit, or monetize your private financial data.',
        proTip: 'Your recent calculations are stored locally in your browser’s localStorage so you can jump back anytime without needing an account or login.',
      },
      {
        id: 'dir-2',
        tag: 'Accuracy',
        question: 'What mathematical standards do these calculators follow?',
        answer:
          'Our financial algorithms follow standard US banking actuarial formulas: CFPB-compliant monthly amortized loan formulas, compound interest schedules with configurable compounding intervals, and IRS-aligned tax estimations.',
        proTip: 'You can generate an official branded PDF summary report or export an Excel CSV spreadsheet at any time.',
      },
      {
        id: 'dir-3',
        tag: 'Currencies',
        question: 'Does the calculator support international currencies?',
        answer:
          'Yes! While configured by default for US Dollar ($), SmartFinCalc supports 9 global currencies including US Dollar ($), Pakistani Rupee (Rs), Euro (€), British Pound (£), Indian Rupee (₹), Canadian Dollar (CA$), Australian Dollar (A$), UAE Dirham (AED), and Saudi Riyal (SAR).',
        proTip: 'Use the currency selector in the header to switch symbols and regional formatting instantly without losing your calculation values.',
      },
    ],
  },
};
