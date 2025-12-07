'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Plane } from 'lucide-react';
import { useState } from 'react';
import { VfrAssessment, AssessmentStatus, FactorAssessment } from '@/lib/aviation-types';

interface VfrAssessmentCardProps {
  assessment: VfrAssessment;
}

function StatusIcon({ status }: { status: AssessmentStatus }) {
  switch (status) {
    case 'GO':
      return <CheckCircle2 className="h-6 w-6 text-emerald-400" />;
    case 'CAUTION':
      return <AlertTriangle className="h-6 w-6 text-amber-400" />;
    case 'NO-GO':
      return <XCircle className="h-6 w-6 text-red-400" />;
  }
}

function SmallStatusIcon({ status }: { status: AssessmentStatus }) {
  switch (status) {
    case 'GO':
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    case 'CAUTION':
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    case 'NO-GO':
      return <XCircle className="h-4 w-4 text-red-400" />;
  }
}

function getStatusColor(status: AssessmentStatus): string {
  switch (status) {
    case 'GO':
      return 'bg-emerald-500/20 border-emerald-500/30';
    case 'CAUTION':
      return 'bg-amber-500/20 border-amber-500/30';
    case 'NO-GO':
      return 'bg-red-500/20 border-red-500/30';
  }
}

function getFlightCategoryColor(category: string): string {
  switch (category) {
    case 'VFR':
      return 'text-emerald-400';
    case 'MVFR':
      return 'text-blue-400';
    case 'IFR':
      return 'text-red-400';
    case 'LIFR':
      return 'text-purple-400';
    default:
      return 'text-white';
  }
}

function FactorRow({ name, factor }: { name: string; factor: FactorAssessment }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
      <div className="flex items-center gap-2">
        <SmallStatusIcon status={factor.status} />
        <span className="text-white/80 capitalize">{name}</span>
      </div>
      <span className="text-white/60 text-sm">{factor.message}</span>
    </div>
  );
}

export function VfrAssessmentCard({ assessment }: VfrAssessmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border backdrop-blur-lg overflow-hidden ${getStatusColor(assessment.overall)}`}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              assessment.overall === 'GO' ? 'bg-emerald-500/30' :
              assessment.overall === 'CAUTION' ? 'bg-amber-500/30' :
              'bg-red-500/30'
            }`}>
              <StatusIcon status={assessment.overall} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {assessment.overall === 'GO' ? 'VFR GO' :
                 assessment.overall === 'CAUTION' ? 'VFR CAUTION' :
                 'VFR NO-GO'}
              </h2>
              <p className={`text-sm font-medium ${getFlightCategoryColor(assessment.flightCategory)}`}>
                Flight Category: {assessment.flightCategory}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Plane className="h-5 w-5" />
            <span className="text-sm">C172</span>
          </div>
        </div>

        {/* Recommendation */}
        <p className="text-white/80 text-sm leading-relaxed">
          {assessment.recommendation}
        </p>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 transition-colors
                 flex items-center justify-center gap-2 text-white/60 text-sm"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Show Details
          </>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-6 pb-6"
        >
          <div className="pt-4 space-y-1">
            <FactorRow name="Ceiling" factor={assessment.factors.ceiling} />
            <FactorRow name="Visibility" factor={assessment.factors.visibility} />
            <FactorRow name="Wind" factor={assessment.factors.wind} />
            <FactorRow name="Gusts" factor={assessment.factors.gusts} />
            <FactorRow name="Crosswind" factor={assessment.factors.crosswind} />
            <FactorRow name="Precipitation" factor={assessment.factors.precipitation} />
            <FactorRow name="Thunderstorms" factor={assessment.factors.thunderstorms} />
          </div>

          {/* C172 Limits Reference */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-white/40 mb-2">Cessna 172 VFR Limits:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
              <span>Ceiling: 3000+ ft</span>
              <span>Visibility: 5+ SM</span>
              <span>Wind: &lt;15 kts</span>
              <span>Crosswind: &lt;12 kts</span>
              <span>Gusts: &lt;20 kts</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
