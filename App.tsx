
import React, { useState, useMemo } from 'react';
import { Loader2, ChevronRight, Calculator, Wallet, Percent, CheckCircle, AlertCircle, TrendingUp, DollarSign, Users, FileText, Scale, Coins, MapPin, ShieldAlert, Lightbulb } from 'lucide-react';
import { FormData, AnalysisResult, DeepReport } from './types';
import { calculateROIWithAI, generateDeepReportWithAI } from './services/geminiService';
import { 
  BUSINESS_CONSTANTS, 
  HOUSING_OPTIONS, 
  PROPERTY_TYPES, 
  LOAN_RATIO_OPTIONS, 
  REPAIR_RATE_OPTIONS 
} from './constants';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiReport, setAiReport] = useState<DeepReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    caseNumber: '',
    address: '',
    propertyType: '주거용 (아파트/빌라/주택)',
    bidPrice: '',
    sellPrice: '',
    repairRate: '3.0',
    loanRate: '5.0',
    loanRatio: '80',
    isRegulated: false,
    housingCountA: '무주택',
    housingCountB: '1주택',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return '0원';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  const calculatedLoanAmount = useMemo(() => {
    const bid = Number(formData.bidPrice);
    if (!bid) return 0;
    return Math.floor(bid * (Number(formData.loanRatio) / 100));
  }, [formData.bidPrice, formData.loanRatio]);

  const calculatedRepairCost = useMemo(() => {
    const bid = Number(formData.bidPrice);
    if (!bid) return 0;
    return Math.floor(bid * (Number(formData.repairRate) / 100));
  }, [formData.bidPrice, formData.repairRate]);

  const calculateROI = async () => {
    if (!formData.address || !formData.bidPrice || !formData.sellPrice) {
      alert("주소, 낙찰가, 매도 예상가를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAiReport(null);

    try {
      const analysis = await calculateROIWithAI(formData, calculatedLoanAmount, calculatedRepairCost);
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const generateDeepReport = async () => {
    if (!result || !formData.address) return;
    setReportLoading(true);
    try {
      const report = await generateDeepReportWithAI(formData, result);
      setAiReport(report);
    } catch (err: any) {
      console.error(err);
      alert("리포트 생성에 실패했습니다.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
              <Calculator size={22} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              경매 ROI 계산기 <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-2 border border-indigo-100">매매사업자용</span>
            </h1>
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest hidden sm:block">
            Gemini 3.0 Pro Powered
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-8 lg:grid-cols-12 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
              <FileText className="text-indigo-600" size={20} />
              매물 및 투자 설정
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">사건번호</label>
                  <input
                    type="text"
                    name="caseNumber"
                    value={formData.caseNumber}
                    onChange={handleInputChange}
                    placeholder="2024타경123"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">부동산 종류</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 transition-all outline-none text-sm bg-white"
                  >
                    {PROPERTY_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">물건지 주소</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="예: 경기도 성남시 분당구 아파트"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none text-sm"
                />
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      name="isRegulated"
                      checked={formData.isRegulated}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-indigo-900 text-sm">규제지역 (조정대상지역)</span>
                    <p className="text-[11px] text-indigo-700 mt-0.5 leading-tight">
                      주거용 매물 시 다주택자 취득세 중과(8%~12%)가 적용됩니다.
                    </p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase flex items-center gap-1">
                    <Users size={10} /> 대표 A 주택수
                  </label>
                  <select
                    name="housingCountA"
                    value={formData.housingCountA}
                    onChange={handleInputChange}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                  >
                    {HOUSING_OPTIONS.map(opt => <option key={`A-${opt}`} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase flex items-center gap-1">
                    <Users size={10} /> 대표 B 주택수
                  </label>
                  <select
                    name="housingCountB"
                    value={formData.housingCountB}
                    onChange={handleInputChange}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                  >
                    {HOUSING_OPTIONS.map(opt => <option key={`B-${opt}`} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">낙찰가 (매수가)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="bidPrice"
                      value={formData.bidPrice}
                      onChange={handleInputChange}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">매도 예상가</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="sellPrice"
                      value={formData.sellPrice}
                      onChange={handleInputChange}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">원</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">대출 비율 (LTV)</label>
                  <select
                    name="loanRatio"
                    value={formData.loanRatio}
                    onChange={handleInputChange}
                    className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none mb-2"
                  >
                    {LOAN_RATIO_OPTIONS.map(r => <option key={r} value={r}>{r}% 대출</option>)}
                  </select>
                  <div className="text-right text-xs font-bold text-indigo-600">
                    {formatCurrency(calculatedLoanAmount)}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">연 대출 금리 (%)</label>
                  <input
                    type="number"
                    name="loanRate"
                    value={formData.loanRate}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none h-[38px]"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">수리/기타 제반비용 비율</label>
                <select
                  name="repairRate"
                  value={formData.repairRate}
                  onChange={handleInputChange}
                  className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none mb-2"
                >
                  {REPAIR_RATE_OPTIONS.map(rate => <option key={rate} value={rate}>{rate}%</option>)}
                </select>
                <div className="text-right text-xs font-bold text-indigo-600">
                  {formatCurrency(calculatedRepairCost)}
                </div>
              </div>

              <button
                onClick={calculateROI}
                disabled={loading}
                className={`w-full py-4 mt-2 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                  loading 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> AI가 계산하고 있습니다...
                  </>
                ) : (
                  <>
                    수익률 분석하기 <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </section>

          <div className="bg-slate-200/50 p-4 rounded-2xl border border-slate-200">
             <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-slate-500" />
                <h4 className="text-xs font-bold text-slate-600 uppercase">분석 시스템 로직</h4>
             </div>
             <ul className="text-[11px] text-slate-500 space-y-1.5 list-disc pl-4">
                <li>공동매매사업자 5:5 지분 구조 기반</li>
                <li><b>비주거용</b> 선택 시 다주택 여부 관계없이 취득세 4.6%</li>
                <li>실투자금에는 6개월치 대출 이자 예비비가 포함됨</li>
                <li>공동사업자의 종합소득세 분산 효과를 반영한 세후 수익 계산</li>
             </ul>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-5 rounded-2xl flex items-center gap-4 border border-red-100 animate-in fade-in zoom-in duration-300">
              <AlertCircle size={28} className="shrink-0" />
              <p className="text-sm font-medium leading-tight">{error}</p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-3xl min-h-[500px] p-12 text-center">
              <div className="bg-slate-50 p-8 rounded-full mb-6">
                <Wallet size={64} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-2">분석 대기 중</h3>
              <p className="text-sm text-slate-400">좌측에 물건 정보를 입력하고 <br/>AI 수익률 분석을 시작해보세요.</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
              
              {/* Cash Needed Card */}
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                   <Coins size={200} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-slate-400">
                    <Coins size={18} className="text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-widest">초기 필요 현금 (실투자금)</span>
                  </div>
                  <div className="flex items-baseline gap-3 mb-8">
                    <h2 className="text-5xl font-black text-amber-400 tracking-tight">
                      {formatCurrency(result.initialInvestment)}
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {result.detail?.investmentBreakdown?.map((item, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">{item.label}</p>
                        <p className="text-sm font-bold text-slate-200">{formatCurrency(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROI Main Card */}
              <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-blue-800 text-white p-8 rounded-3xl shadow-xl border border-white/10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">최종 예상 수익률 (ROI)</p>
                    <h2 className="text-6xl font-black tracking-tighter">{result.roi}%</h2>
                  </div>
                  {formData.caseNumber && (
                    <span className="bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/20 uppercase tracking-widest">
                      CASE {formData.caseNumber}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">세전 영업 이익</p>
                    <p className="text-xl font-bold">{formatCurrency(result.totalProfitBeforeTax)}</p>
                  </div>
                  <div>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">세후 순수익</p>
                    <p className="text-xl font-bold text-amber-300">{formatCurrency(result.netProfit)}</p>
                  </div>
                </div>
              </div>

              {/* AI Report Trigger */}
              {!aiReport ? (
                <button
                  onClick={generateDeepReport}
                  disabled={reportLoading}
                  className="w-full py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-3xl shadow-2xl font-black text-base flex items-center justify-center gap-3 hover:opacity-95 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {reportLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} /> AI 전문가가 매물 입지를 분석하고 있습니다...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="text-amber-300" size={24} /> ⚡️ AI 심층 분석 보고서 생성하기
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-fuchsia-100 animate-in fade-in zoom-in duration-500">
                  <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-fuchsia-100 rounded-xl">
                      <Lightbulb className="text-fuchsia-600" size={24} />
                    </div>
                    AI 투자 심층 리포트
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                      <h4 className="font-black text-indigo-900 text-xs mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <MapPin size={16} className="text-indigo-600" /> 입지 및 가치 분석
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiReport.locationAnalysis}</p>
                    </div>
                    <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100/50">
                      <h4 className="font-black text-rose-900 text-xs mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <ShieldAlert size={16} className="text-rose-600" /> 리스크 요인 분석
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiReport.riskFactors}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
                      <h4 className="font-black text-emerald-900 text-xs mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <TrendingUp size={16} className="text-emerald-600" /> 매도 및 출구 전략
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiReport.exitStrategy}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* P&L Statement */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                   <FileText className="text-indigo-600" size={22} />
                   손익 계산 상세 (P&L)
                </h3>

                <div className="space-y-6">
                   <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <span className="text-slate-500 text-sm font-bold uppercase">➕ 예상 총 매출 (매도가)</span>
                      <span className="text-slate-900 font-black text-2xl">{formatCurrency(result.detail?.revenue)}</span>
                   </div>

                   <div className="bg-slate-50/80 p-6 rounded-2xl space-y-3 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">➖ 총 지출 비용 (취득원가 및 경비)</p>
                      {result.detail?.costBreakdown?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-600 font-medium">{item.label}</span>
                          <span className="text-slate-900 font-bold">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-rose-600 text-base">
                         <span>총 투입 원가</span>
                         <span>{formatCurrency(result.totalCost)}</span>
                      </div>
                   </div>

                   <div className="bg-slate-50/80 p-6 rounded-2xl space-y-3 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">➖ 예상 세금 (종합소득세)</p>
                      {result.detail?.taxBreakdown?.map((item, idx) => (
                         <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-600 font-medium">{item.label}</span>
                            <span className="text-slate-900 font-bold">{formatCurrency(item.amount)}</span>
                         </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Tax & Split Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Scale size={18} className="text-slate-400"/> 취득세 상세 분석
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/30">
                        <span className="block text-[10px] font-black text-indigo-600 mb-1 uppercase">대표 A</span>
                        <span className="text-xs font-bold text-slate-700 leading-snug">{result.repATaxDetail}</span>
                      </div>
                      <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/30">
                        <span className="block text-[10px] font-black text-blue-600 mb-1 uppercase">대표 B</span>
                        <span className="text-xs font-bold text-slate-700 leading-snug">{result.repBTaxDetail}</span>
                      </div>
                    </div>
                 </div>

                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-widest">
                       <DollarSign size={18} className="text-emerald-500"/> 수익 배분 (50:50)
                    </h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center p-4 bg-emerald-50/20 rounded-2xl">
                          <span className="text-slate-600 text-sm font-bold">대표 A</span>
                          <span className="font-black text-lg text-slate-800">{formatCurrency(result.equityProfitA)}</span>
                       </div>
                       <div className="flex justify-between items-center p-4 bg-emerald-50/20 rounded-2xl">
                          <span className="text-slate-600 text-sm font-bold">대표 B</span>
                          <span className="font-black text-lg text-slate-800">{formatCurrency(result.equityProfitB)}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* AI Comment */}
              <div className="bg-slate-800 text-slate-200 p-6 rounded-3xl text-sm flex gap-4 shadow-lg">
                <CheckCircle className="shrink-0 text-emerald-400" size={24} />
                <p className="font-medium leading-relaxed italic">"{result.comment}"</p>
              </div>
              
              <footer className="text-center p-8 space-y-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Legal Disclaimer</p>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
                  본 분석 결과는 AI에 의한 모의 추정치이며, 실제 대출 승인 여부, 금리, 취득세 및 양도소득세는 관할 관청 및 금융기관, 세무 전문가와의 확인이 반드시 필요합니다.
                </p>
              </footer>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
