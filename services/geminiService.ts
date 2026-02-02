
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, AnalysisResult, DeepReport } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const calculateROIWithAI = async (formData: FormData, calculatedLoan: number, calculatedRepair: number): Promise<AnalysisResult> => {
  const ai = getAI();
  
  // 대한민국 최신 취득세 및 매매사업자 세법 가이드라인 주입
  const systemInstruction = `당신은 대한민국 최고의 부동산 경매 및 세무 전문가입니다.
  다음의 한국 세법 가이드라인에 따라 [부동산 매매사업자(공동사업자 5:5)]의 수익률을 계산하세요:

  1. 취득세 계산 (주거용):
     - 지분은 대표 A(50%), 대표 B(50%)로 나뉩니다. 각자의 기존 주택수와 규제지역 여부에 따라 각자의 세율을 적용한 뒤 합산하세요.
     - 표준세율(비중과): 6억 이하 1%, 6억 초과~9억 이하 1.33~2.99%(사선세율), 9억 초과 3%. (지방교육세 0.1~0.3% 별도)
     - 중과세율(지방교육세/농어촌특별세 별도):
       * 비조정지역: 1~2주택(표준), 3주택(8%), 4주택 이상(12%)
       * 조정대상지역: 1주택(표준), 2주택(8%), 3주택 이상(12%)
     - 법인/매매사업자 중과: 주거용 주택 취득 시 중과 세율 적용 원칙 준수.

  2. 취득세 계산 (비주거용):
     - 주택수 무관하게 일괄 4.6% (취득세 4% + 농특세 0.2% + 지방교육세 0.4%) 적용.

  3. 실투자금 산출:
     - (낙찰가 - 대출금액) + 취득세 + 수리비 + 6개월분 이자 예비비.

  4. 세전/세후 이익:
     - 세전이익 = 매도예상가 - (낙찰가 + 취득세 + 수리비 + 대출이자 6개월분).
     - 소득세(매매사업자): 공동사업자이므로 수익을 5:5로 나눈 뒤, 각자의 소득 수준에 따른 누진세율(6~45%)을 적용하되, 이 계산기에서는 간이적으로 1인당 기본 공제와 표준 세율 구간을 적용하여 계산하세요.

  반드시 JSON 형식으로 응답하며, repATaxDetail과 repBTaxDetail에 왜 해당 세율이 적용되었는지 상세 근거를 적으세요.`;

  const prompt = `
    [분석 대상 데이터]
    - 부동산 종류: ${formData.propertyType}
    - 물건지 주소: ${formData.address}
    - 규제지역 여부: ${formData.isRegulated ? "조정대상지역" : "비조정지역"}
    - 투자자 현황: 
      * 대표 A: ${formData.housingCountA} (현재 주택 상태)
      * 대표 B: ${formData.housingCountB} (현재 주택 상태)
    - 금액 정보:
      * 낙찰가: ${formData.bidPrice}원
      * 매도 예상가: ${formData.sellPrice}원
      * 대출금액: ${calculatedLoan}원 (연 이율 ${formData.loanRate}%)
      * 수리비 및 기타경비: ${calculatedRepair}원
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          initialInvestment: { type: Type.NUMBER },
          totalAcquisitionTax: { type: Type.NUMBER },
          repATaxDetail: { type: Type.STRING },
          repBTaxDetail: { type: Type.STRING },
          totalInterestCost: { type: Type.NUMBER },
          totalExpenses: { type: Type.NUMBER },
          totalCost: { type: Type.NUMBER },
          totalProfitBeforeTax: { type: Type.NUMBER },
          incomeTax: { type: Type.NUMBER },
          netProfit: { type: Type.NUMBER },
          roi: { type: Type.NUMBER },
          equityProfitA: { type: Type.NUMBER },
          equityProfitB: { type: Type.NUMBER },
          comment: { type: Type.STRING },
          detail: {
            type: Type.OBJECT,
            properties: {
              revenue: { type: Type.NUMBER },
              investmentBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  }
                }
              },
              costBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  }
                }
              },
              taxBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateDeepReportWithAI = async (formData: FormData, result: AnalysisResult): Promise<DeepReport> => {
  const ai = getAI();
  const prompt = `
    주소: ${formData.address}
    부동산 종류: ${formData.propertyType}
    낙찰가: ${formData.bidPrice}원
    예상 매도가: ${formData.sellPrice}원
    예상 수익률: ${result.roi}% (순수익: ${result.netProfit}원)
    위 정보를 바탕으로 심층 리포트를 작성하세요.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "부동산 투자 전략가로서 입지분석, 리스크, 출구전략을 분석하여 JSON으로 반환하세요.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          locationAnalysis: { type: Type.STRING },
          riskFactors: { type: Type.STRING },
          exitStrategy: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
