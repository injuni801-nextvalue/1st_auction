
import React from 'react';
import { Building2, Calculator, Wallet, Percent, CheckCircle, AlertCircle, TrendingUp, DollarSign, Users, FileText, Scale, Coins, MapPin, ShieldAlert, Lightbulb } from 'lucide-react';

export const BUSINESS_CONSTANTS = {
  entityType: "부동산 매매사업자 (공동 사업)",
  shareStructure: "대표 A (50%) : 대표 B (50%)",
};

export const HOUSING_OPTIONS = ["무주택", "1주택", "2주택", "3주택 이상"];
export const PROPERTY_TYPES = ["주거용 (아파트/빌라/주택)", "비주거용 (상가/토지/오피스텔)"];
export const LOAN_RATIO_OPTIONS = [80, 70, 60, 50, 40, 0];

export const REPAIR_RATE_OPTIONS = Array.from({ length: 13 }, (_, i) => (1.0 + i * 0.5).toFixed(1));

export const ICONS = {
  Building2: <Building2 size={24} />,
  Calculator: <Calculator size={20} />,
  Wallet: <Wallet size={48} />,
  Percent: <Percent size={20} />,
  CheckCircle: <CheckCircle size={20} />,
  AlertCircle: <AlertCircle size={24} />,
  TrendingUp: <TrendingUp size={16} />,
  DollarSign: <DollarSign size={16} />,
  Users: <Users size={12} />,
  FileText: <FileText size={20} />,
  Scale: <Scale size={16} />,
  Coins: <Coins size={20} />,
  MapPin: <MapPin size={16} />,
  ShieldAlert: <ShieldAlert size={16} />,
  Lightbulb: <Lightbulb size={20} />,
};
