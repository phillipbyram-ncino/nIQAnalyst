import { Injectable } from "@angular/core";
import { Metric } from "../components/metric-card.component";

export enum Risk {
    'At-Risk', 'No-Risk'
}
export enum PeriodSuccess {
    'Pass', 'Fail'
}

export interface ApprovalOptions {
    allowableFailedMetrics: number;
    allowableFailedPeriods?: number;
    allowableFailedPeriodsRatio?: number;
}

@Injectable({ providedIn: 'root' })
export class MetricsFormulaService {


    isMetricSuccessful(metric: Metric): boolean {

        return metric.min <= metric.value && metric.value <= metric.max
    }
    isMetricLowRisk(metric: Metric): boolean {
        switch (metric.metricBounds) {
            case "upper":
                return metric.value < (metric.max - metric.boundsMargin);
            case "lower":
                return metric.value > (metric.min + metric.boundsMargin);
            case "both":
                return (metric.value < (metric.max - metric.boundsMargin)) && (metric.value > (metric.min + metric.boundsMargin));
            case "neither":
                return false;
        }

    }
    isPeriodFailure(metricList?: Array<Metric>, approvalOptions?: ApprovalOptions, numFailures?: number): boolean {
        if (!metricList) {
            return (numFailures || 0) > (approvalOptions?.allowableFailedMetrics || -1)
        }

        const successfulMetrics = metricList.filter((m) => this.isMetricSuccessful(m));

        return (metricList.length - successfulMetrics.length) > (approvalOptions?.allowableFailedMetrics || 0);
    }


    isApplicationFailure(periodList: Array<Array<Metric>>, approvalOptions?: ApprovalOptions): boolean {

        const options: ApprovalOptions = this.extrapolateOptions(periodList.length, approvalOptions);

        const failedPeriods = periodList.filter((m) => this.isPeriodFailure(m, options));

        return failedPeriods.length > (options?.allowableFailedPeriods || 0);
    }

    getAllowableRiskyPeriods(numPeriods: number, approvalOptions: ApprovalOptions): number {

        return this.getAllowedNumFromRatio((approvalOptions?.allowableFailedPeriodsRatio || 0), numPeriods);

    }
    private getAllowedNumFromRatio(ratio: number, num: number): number {
        return Math.round(num * ratio);
    }
    private getAllowedRatioFromNum(allowedNum: number, num: number): number {
        return Math.round(allowedNum / num);
    }

    private extrapolateOptions(numPeriods: number, options?: ApprovalOptions,): ApprovalOptions {
        const emptyOptions = { allowableFailedMetrics: 0, allowableFailedPeriods: 0, allowableFailedPeriodsRatio: 0 } as ApprovalOptions;
        if (!options) {
            return emptyOptions;
        }
        if (options.allowableFailedPeriodsRatio) {
            return { ...options, allowableFailedPeriods: this.getAllowedNumFromRatio(options.allowableFailedPeriodsRatio, numPeriods) }
        }
        if (options.allowableFailedPeriods) {
            return { ...options, allowableFailedPeriodsRatio: this.getAllowedRatioFromNum(options.allowableFailedPeriods, numPeriods) }
        }
        return emptyOptions;

    }

}