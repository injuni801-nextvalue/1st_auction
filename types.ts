
export interface FormData {
  caseNumber: string;
  address: string;
  propertyType: '주거용 (아파트/빌라/주택)' | '비주거용 (상가/토지/오피스텔)';
  bidPrice: string;
  sellPrice: string;
  repairRate: string;
  loanRate: string;
  loanRatio: string;
  isRegulated: boolean;
  housingCountA: string;
  housingCountB: string;
}

export interface InvestmentItem {
  label: string;
  amount: number;
}

export interface AnalysisResult {
  initialInvestment: number;
  totalAcquisitionTax: number;
  repATaxDetail: string;
  repBTaxDetail: string;
  totalInterestCost: number;
  totalExpenses: number;
  totalCost: number;
  totalProfitBeforeTax: number;
  incomeTax: number;
  netProfit: number;
  roi: number;
  equityProfitA: number;
  equityProfitB: number;
  comment: string;
  detail: {
    revenue: number;
    investmentBreakdown: InvestmentItem[];
    costBreakdown: InvestmentItem[];
    taxBreakdown: InvestmentItem[];
  };
}

export interface DeepReport {
  locationAnalysis: string;
  riskFactors: string;
  exitStrategy: string;
}
