# Incident Report: 2024-12-02-1

**Date**: December 2, 2024  
**Severity**: Medium  
**Status**: Resolved  
**Duration**: ~5-10 minutes (10:40 AM - 10:50 AM)

## Summary
During the scheduled chaos testing window, the JWT Pizza Service experienced a sudden traffic spike with authentication attempts reaching 5000/sec and total HTTP requests reaching 35,000/sec. The service remained operational throughout the incident with only moderate latency increases. As a precautionary measure, the ECS service was restarted to ensure system stability.

## Timeline (MST)

- **10:30 AM**: Alert triggered email notification, reviewed logs and grafana dashboard
- **10:40 AM**: Massive traffic spike began
  - Authentication attempts: ~5000/sec (baseline: <10/sec)
  - Total HTTP requests: ~35,000/sec (baseline: ~100/sec)
  - Service latency increased to 100-110ms (baseline: 40-60ms)
  - Pizza metrics spiked to 4000+ orders/minute
- **10:45 AM**: Performed ECS service restart via "Force new deployment" as precautionary measure
- **10:50 AM**: Traffic returned to normal levels, new task fully operational
- **10:55 AM**: All metrics returned to baseline

As a note: (- **9:32 AM**: Initial alert fired from Grafana monitoring system however I watched as this resolved its self, seemed to be a no data FALSE ALARM )

## Root Cause
Chaos testing initiated via pizza-factory.cs329.click triggered a DDoS-style traffic flood to test service resilience under extreme load conditions.

## Impact
- **Users Affected**: Minimal - service remained operational with increased latency
- **Orders**: Orders continued processing throughout incident
- **Peak Latency**: 100-110ms (50-70ms above baseline)
- **Downtime**: 0 minutes - no complete outage occurred

## Detection
- Grafana alert triggered at 9:21 AM indicating anomaly
- Visual confirmation via dashboard metrics showing traffic spike at 10:40 AM
- CloudWatch logs showed continued successful operations
- Monitoring dashboards provided real-time visibility into all service metrics

## Response Actions
1. **10:30 AM**: Received and acknowledged alert notification
2. **10:30 AM**: Reviewed Grafana dashboard showing traffic patterns
3. **10:35 AM**: Checked CloudWatch logs - confirmed service operational
4. **10:40 AM**: Observed massive traffic spike in real-time on dashboard
5. **10:45 AM**: Executed ECS service restart:
   - Navigated to ECS Console → Clusters → jwt-pizza-cluster
   - Selected jwt-pizza-service
   - Clicked "Update service"
   - Enabled "Force new deployment"
   - Confirmed update
6. **10:50 AM**: Verified new task started successfully and metrics normalized

## Resolution
Service was successfully stabilized through combination of:
- AWS infrastructure handling initial traffic spike
- Proactive ECS service restart ensuring clean state
- Verification of all systems operational post-restart

**Response time from alert to action: 1 hour 24 minutes (well within 4-hour SLA)**

## Lessons Learned

### What Went Well
- Alert system successfully detected anomaly within 1 minute
- Responded promptly with investigation and remediation
- Service infrastructure proved resilient under 350x normal load
- Monitoring dashboards provided clear visibility into incident progression
- ECS service restart executed smoothly with zero downtime
- Full recovery achieved within 25 minutes of traffic spike

### What Could Be Improved
- Could implement rate limiting to mitigate DDoS-style attacks
- Could configure ECS auto-scaling to automatically handle traffic spikes
- Alert message could be more descriptive about specific metric thresholds exceeded
- Could benefit from automated runbooks for common incident types

## Action Items
- [ ] Implement rate limiting middleware (priority: medium)
- [ ] Configure ECS Service Auto Scaling with target tracking policies (priority: high)
- [ ] Review and optimize alert thresholds to provide clearer severity indicators (priority: low)
- [ ] Create incident response runbook for traffic spike scenarios (priority: medium)
- [ ] Document baseline traffic patterns and expected ranges (priority: low)

## Supporting Evidence
- Grafana dashboard screenshots showing traffic spike from 10:40-10:50 AM
- CloudWatch logs confirming continued operation throughout incident
- ECS deployment history showing service restart at 10:45 AM
- Alert notification received at 9:21 AM
