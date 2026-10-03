import { AmortizationPeriod } from '../types/financial';

// --- MORTGAGE CALCULATOR ---
export interface MortgageInput {
  homePrice: number;
  downPaymentPercent: number;
  loanTermYears: number;
  interestRate: number; // annual percentage, e.g. 6.5
  propertyTaxAnnual: number;
  homeInsuranceAnnual: number;
  pmiPercent: number; // annual PMI % of loan if down payment < 20%
  hoaMonthly: number;
  extraMonthlyPayment: number;
}

export interface MortgageResult {
  loanAmount: number;
  downPaymentAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  totalCostOfLoan: number;
  totalPayments: number;
  payoffYears: number;
  interestSavedWithExtra: number;
  monthsSavedWithExtra: number;
  annualSchedule: AmortizationPeriod[];
  monthlySchedule: AmortizationPeriod[];
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const downPaymentAmount = (input.homePrice * input.downPaymentPercent) / 100;
  const loanAmount = Math.max(0, input.homePrice - downPaymentAmount);
  
  const monthlyRate = input.interestRate > 0 ? input.interestRate / 100 / 12 : 0;
  const totalMonths = input.loanTermYears * 12;

  let baseMonthlyPI = 0;
  if (loanAmount <= 0) {
    baseMonthlyPI = 0;
  } else if (monthlyRate === 0) {
    baseMonthlyPI = loanAmount / totalMonths;
  } else {
    baseMonthlyPI =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const monthlyPropertyTax = input.propertyTaxAnnual / 12;
  const monthlyHomeInsurance = input.homeInsuranceAnnual / 12;
  const hasPmi = input.downPaymentPercent < 20 && input.pmiPercent > 0;
  const monthlyPmi = hasPmi ? (loanAmount * (input.pmiPercent / 100)) / 12 : 0;
  const monthlyHoa = input.hoaMonthly;

  const totalMonthlyPayment =
    baseMonthlyPI +
    monthlyPropertyTax +
    monthlyHomeInsurance +
    monthlyPmi +
    monthlyHoa +
    input.extraMonthlyPayment;

  // Compute schedules
  const monthlySchedule: AmortizationPeriod[] = [];
  const annualSchedule: AmortizationPeriod[] = [];

  let balance = loanAmount;
  let totalInterest = 0;
  let month = 1;

  let currentYearInterest = 0;
  let currentYearPrincipal = 0;
  let currentYearPayment = 0;

  const effectiveMonthlyPayment = baseMonthlyPI + input.extraMonthlyPayment;

  while (balance > 0.01 && month <= totalMonths + 120) {
    const interestForMonth = balance * monthlyRate;
    let principalForMonth = effectiveMonthlyPayment - interestForMonth;

    if (principalForMonth > balance) {
      principalForMonth = balance;
    }

    const actualPayment = principalForMonth + interestForMonth;
    balance -= principalForMonth;
    totalInterest += interestForMonth;

    monthlySchedule.push({
      period: month,
      label: `Month ${month}`,
      payment: actualPayment,
      principal: principalForMonth,
      interest: interestForMonth,
      totalInterest: totalInterest,
      remainingBalance: Math.max(0, balance),
      extraPayment: input.extraMonthlyPayment,
    });

    currentYearInterest += interestForMonth;
    currentYearPrincipal += principalForMonth;
    currentYearPayment += actualPayment;

    if (month % 12 === 0 || balance <= 0.01) {
      const yearNum = Math.ceil(month / 12);
      annualSchedule.push({
        period: yearNum,
        label: `Year ${yearNum}`,
        payment: currentYearPayment,
        principal: currentYearPrincipal,
        interest: currentYearInterest,
        totalInterest: totalInterest,
        remainingBalance: Math.max(0, balance),
      });
      currentYearInterest = 0;
      currentYearPrincipal = 0;
      currentYearPayment = 0;
    }

    month++;
  }

  // Calculate baseline interest without extra payment
  let baselineTotalInterest = 0;
  if (monthlyRate > 0 && loanAmount > 0) {
    baselineTotalInterest = baseMonthlyPI * totalMonths - loanAmount;
  }
  const interestSavedWithExtra = Math.max(0, baselineTotalInterest - totalInterest);
  const actualMonthsPaid = monthlySchedule.length;
  const monthsSavedWithExtra = Math.max(0, totalMonths - actualMonthsPaid);

  return {
    loanAmount,
    downPaymentAmount,
    monthlyPrincipalAndInterest: baseMonthlyPI,
    monthlyPropertyTax,
    monthlyHomeInsurance,
    monthlyPmi,
    monthlyHoa,
    totalMonthlyPayment,
    totalInterestPaid: totalInterest,
    totalCostOfLoan: loanAmount + totalInterest,
    totalPayments: actualMonthsPaid,
    payoffYears: Number((actualMonthsPaid / 12).toFixed(1)),
    interestSavedWithExtra,
    monthsSavedWithExtra,
    annualSchedule,
    monthlySchedule,
  };
}

// --- GENERAL LOAN CALCULATOR ---
export interface LoanInput {
  loanAmount: number;
  loanTermMonths: number;
  interestRate: number; // annual %
  frequency: 'monthly' | 'biweekly' | 'weekly';
}

export interface LoanResult {
  paymentPerPeriod: number;
  numberOfPayments: number;
  totalPaymentsAmount: number;
  totalInterestPaid: number;
  schedule: AmortizationPeriod[];
}

export function calculateLoan(input: LoanInput): LoanResult {
  const { loanAmount, loanTermMonths, interestRate, frequency } = input;
  if (loanAmount <= 0) {
    return {
      paymentPerPeriod: 0,
      numberOfPayments: 0,
      totalPaymentsAmount: 0,
      totalInterestPaid: 0,
      schedule: [],
    };
  }

  const periodsPerYear = frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : 12;
  const totalYears = loanTermMonths / 12;
  const numberOfPayments = Math.round(totalYears * periodsPerYear);
  const ratePerPeriod = (interestRate / 100) / periodsPerYear;

  let paymentPerPeriod = 0;
  if (ratePerPeriod === 0) {
    paymentPerPeriod = loanAmount / numberOfPayments;
  } else {
    paymentPerPeriod =
      (loanAmount * (ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments))) /
      (Math.pow(1 + ratePerPeriod, numberOfPayments) - 1);
  }

  const schedule: AmortizationPeriod[] = [];
  let balance = loanAmount;
  let totalInterest = 0;

  for (let p = 1; p <= numberOfPayments; p++) {
    const interest = balance * ratePerPeriod;
    let principal = paymentPerPeriod - interest;
    if (principal > balance) principal = balance;

    balance -= principal;
    totalInterest += interest;

    schedule.push({
      period: p,
      label: `Period ${p}`,
      payment: principal + interest,
      principal,
      interest,
      totalInterest,
      remainingBalance: Math.max(0, balance),
    });

    if (balance <= 0.01) break;
  }

  return {
    paymentPerPeriod,
    numberOfPayments: schedule.length,
    totalPaymentsAmount: loanAmount + totalInterest,
    totalInterestPaid: totalInterest,
    schedule,
  };
}

// --- COMPOUND INTEREST & INVESTMENT CALCULATOR ---
export interface InvestmentInput {
  startingAmount: number;
  regularDeposit: number;
  depositFrequency: 'monthly' | 'annually';
  interestRate: number; // annual %
  compoundFrequency: 'monthly' | 'quarterly' | 'annually' | 'daily';
  years: number;
}

export interface InvestmentPeriod {
  year: number;
  startingBalance: number;
  deposits: number;
  interestEarned: number;
  totalInterest: number;
  endingBalance: number;
}

export interface InvestmentResult {
  endBalance: number;
  totalPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  breakdown: InvestmentPeriod[];
}

export function calculateInvestment(input: InvestmentInput): InvestmentResult {
  const { startingAmount, regularDeposit, depositFrequency, interestRate, compoundFrequency, years } = input;
  
  const compPerYear =
    compoundFrequency === 'daily'
      ? 365
      : compoundFrequency === 'quarterly'
      ? 4
      : compoundFrequency === 'monthly'
      ? 12
      : 1;

  const annualDeposit = depositFrequency === 'monthly' ? regularDeposit * 12 : regularDeposit;
  let balance = startingAmount;
  let totalContributions = 0;
  let totalInterest = 0;
  const breakdown: InvestmentPeriod[] = [];

  const rate = interestRate / 100;

  for (let y = 1; y <= years; y++) {
    const startOfYear = balance;
    let yearInterest = 0;
    let yearDeposits = 0;

    // Simulate monthly sub-periods for accuracy
    for (let m = 1; m <= 12; m++) {
      const depositThisMonth = depositFrequency === 'monthly' ? regularDeposit : (m === 12 ? regularDeposit : 0);
      balance += depositThisMonth;
      yearDeposits += depositThisMonth;
      totalContributions += depositThisMonth;

      // Compound rate per month based on compounding config
      const effectiveMonthlyRate = Math.pow(1 + rate / compPerYear, compPerYear / 12) - 1;
      const interestThisMonth = balance * effectiveMonthlyRate;
      balance += interestThisMonth;
      yearInterest += interestThisMonth;
      totalInterest += interestThisMonth;
    }

    breakdown.push({
      year: y,
      startingBalance: startOfYear,
      deposits: yearDeposits,
      interestEarned: yearInterest,
      totalInterest: totalInterest,
      endingBalance: balance,
    });
  }

  return {
    endBalance: balance,
    totalPrincipal: startingAmount,
    totalContributions,
    totalInterest,
    breakdown,
  };
}

// --- AUTO LOAN CALCULATOR ---
export interface AutoLoanInput {
  vehiclePrice: number;
  loanTermMonths: number;
  interestRate: number; // %
  cashDown: number;
  tradeInValue: number;
  tradeInOwed: number;
  salesTaxPercent: number; // %
  dealershipFees: number;
}

export interface AutoLoanResult {
  monthlyPayment: number;
  totalFinanced: number;
  totalInterest: number;
  totalCost: number;
  salesTaxAmount: number;
  netTradeIn: number;
}

export function calculateAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const netTradeIn = Math.max(0, input.tradeInValue - input.tradeInOwed);
  const taxableAmount = Math.max(0, input.vehiclePrice - input.tradeInValue);
  const salesTaxAmount = (taxableAmount * input.salesTaxPercent) / 100;

  const totalFinanced = Math.max(
    0,
    input.vehiclePrice + salesTaxAmount + input.dealershipFees - input.cashDown - netTradeIn
  );

  const monthlyRate = (input.interestRate / 100) / 12;
  const n = input.loanTermMonths;

  let monthlyPayment = 0;
  if (totalFinanced <= 0) {
    monthlyPayment = 0;
  } else if (monthlyRate === 0) {
    monthlyPayment = totalFinanced / n;
  } else {
    monthlyPayment =
      (totalFinanced * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }

  const totalInterest = Math.max(0, monthlyPayment * n - totalFinanced);
  const totalCost = input.vehiclePrice + salesTaxAmount + input.dealershipFees + totalInterest;

  return {
    monthlyPayment,
    totalFinanced,
    totalInterest,
    totalCost,
    salesTaxAmount,
    netTradeIn,
  };
}

// --- RETIREMENT / 401(K) CALCULATOR ---
export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSalary: number;
  salaryGrowthPercent: number;
  currentSavings: number;
  contributionPercent: number;
  employerMatchPercent: number; // up to e.g. 50% of contribution, up to 6% salary
  employerMatchCapPercent: number; // % of salary max
  expectedAnnualReturn: number;
  postRetirementYears: number; // e.g. 30
}

export interface RetirementMilestone {
  age: number;
  salary: number;
  totalSavings: number;
  annualContribution: number;
  investmentGain: number;
}

export interface RetirementResult {
  totalSavingsAtRetirement: number;
  projectedMonthlyIncome4Percent: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  totalGrowth: number;
  milestones: RetirementMilestone[];
}

export function calculateRetirement(input: RetirementInput): RetirementResult {
  const yearsToRetire = Math.max(1, input.retirementAge - input.currentAge);
  let currentSavings = input.currentSavings;
  let currentSalary = input.currentSalary;
  let totalEmployeeContrib = 0;
  let totalEmployerContrib = 0;
  let totalGrowth = 0;

  const milestones: RetirementMilestone[] = [];

  for (let i = 0; i < yearsToRetire; i++) {
    const age = input.currentAge + i;
    
    // Employee contribution
    const employeeContrib = (currentSalary * input.contributionPercent) / 100;
    
    // Employer match
    const matchableSalary = Math.min(
      input.contributionPercent,
      input.employerMatchCapPercent
    );
    const employerContrib =
      (currentSalary * matchableSalary * (input.employerMatchPercent / 100)) / 100;

    const annualContrib = employeeContrib + employerContrib;
    totalEmployeeContrib += employeeContrib;
    totalEmployerContrib += employerContrib;

    // Investment growth
    const returnRate = input.expectedAnnualReturn / 100;
    const gain = (currentSavings + annualContrib / 2) * returnRate;
    totalGrowth += gain;

    currentSavings += annualContrib + gain;

    if (i % 2 === 0 || i === yearsToRetire - 1) {
      milestones.push({
        age: age + 1,
        salary: currentSalary,
        totalSavings: currentSavings,
        annualContribution: annualContrib,
        investmentGain: gain,
      });
    }

    // Salary growth next year
    currentSalary *= 1 + input.salaryGrowthPercent / 100;
  }

  // Safe withdrawal rate (4% rule per year / 12)
  const projectedMonthlyIncome4Percent = (currentSavings * 0.04) / 12;

  return {
    totalSavingsAtRetirement: currentSavings,
    projectedMonthlyIncome4Percent,
    totalEmployeeContributions: totalEmployeeContrib,
    totalEmployerContributions: totalEmployerContrib,
    totalGrowth,
    milestones,
  };
}

// --- INFLATION CALCULATOR ---
export interface InflationInput {
  initialAmount: number;
  annualInflationRate: number; // e.g. 3.2%
  years: number;
}

export interface InflationResult {
  futureEquivalentCost: number; // what costs X today will cost in Y years
  futurePurchasingPower: number; // what X today will be worth in Y years
  cumulativeInflationPercent: number;
  yearlyHistory: { year: number; futureCost: number; purchasingPower: number }[];
}

export function calculateInflation(input: InflationInput): InflationResult {
  const { initialAmount, annualInflationRate, years } = input;
  const rate = annualInflationRate / 100;
  const multiplier = Math.pow(1 + rate, years);
  const futureEquivalentCost = initialAmount * multiplier;
  const futurePurchasingPower = initialAmount / multiplier;
  const cumulativeInflationPercent = (multiplier - 1) * 100;

  const yearlyHistory: { year: number; futureCost: number; purchasingPower: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const m = Math.pow(1 + rate, y);
    yearlyHistory.push({
      year: y,
      futureCost: initialAmount * m,
      purchasingPower: initialAmount / m,
    });
  }

  return {
    futureEquivalentCost,
    futurePurchasingPower,
    cumulativeInflationPercent,
    yearlyHistory,
  };
}

// --- SALARY / TAKE-HOME CALCULATOR ---
export interface SalaryInput {
  grossSalary: number;
  payPeriod: 'annually' | 'monthly' | 'biweekly' | 'hourly';
  hoursPerWeek: number;
  federalTaxPercent: number; // estimated
  stateTaxPercent: number; // estimated
  deductionsAnnual: number; // 401k, health ins, etc.
}

export interface SalaryResult {
  annualGross: number;
  annualNet: number;
  monthlyNet: number;
  biweeklyNet: number;
  weeklyNet: number;
  hourlyNet: number;
  totalTax: number;
  effectiveTaxRate: number;
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  let annualGross = input.grossSalary;
  if (input.payPeriod === 'monthly') annualGross = input.grossSalary * 12;
  else if (input.payPeriod === 'biweekly') annualGross = input.grossSalary * 26;
  else if (input.payPeriod === 'hourly') annualGross = input.grossSalary * input.hoursPerWeek * 52;

  const taxableIncome = Math.max(0, annualGross - input.deductionsAnnual);
  const federalTax = (taxableIncome * input.federalTaxPercent) / 100;
  const stateTax = (taxableIncome * input.stateTaxPercent) / 100;
  // FICA (Social Security 6.2% up to limit, Medicare 1.45%) = 7.65%
  const ficaTax = annualGross * 0.0765;

  const totalTax = federalTax + stateTax + ficaTax;
  const annualNet = Math.max(0, annualGross - totalTax - input.deductionsAnnual);
  const monthlyNet = annualNet / 12;
  const biweeklyNet = annualNet / 26;
  const weeklyNet = annualNet / 52;
  const totalHoursYear = input.hoursPerWeek * 52;
  const hourlyNet = totalHoursYear > 0 ? annualNet / totalHoursYear : 0;
  const effectiveTaxRate = annualGross > 0 ? (totalTax / annualGross) * 100 : 0;

  return {
    annualGross,
    annualNet,
    monthlyNet,
    biweeklyNet,
    weeklyNet,
    hourlyNet,
    totalTax,
    effectiveTaxRate,
  };
}
