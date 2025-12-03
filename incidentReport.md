# Incident Report: 2024-12-03-1

**Date**: December 3, 2024  
**Severity**: High  
**Status**: Resolved  
**Duration**: 8:56:16 AM - 9:03:XX AM (~7 minutes)

## Summary
During the scheduled chaos testing window, the JWT Pizza Factory service began returning 500 errors for all pizza orders, preventing customers from completing purchases. The factory's chaos monkey was activated, causing all order requests to fail with "Failed to fulfill order at factory: chaos monkey" messages. The incident was detected immediately via Grafana alerting system and resolved by accessing the factory-provided resolution endpoint.

## Timeline (MST)
- **8:56:16 AM**: First 500 error occurred on /api/order endpoint
- **8:56:47 AM**: Second order failure (error repeating every ~30 seconds)
- **8:57:18 AM**: Third order failure
- **8:57:49 AM**: Fourth order failure - error pattern established
- **8:57:50 AM**: Grafana alert fired (observed first at this timestamp)
- **8:58:00 AM**: Alert email received with subject "[FIRING:2] Non-200 StatusCode Alert"
- **8:58:19 AM**: Acknowledged alert, opened Grafana dashboard
- **8:58:50 AM**: Investigated logs in Grafana Explore, identified chaos message
- **8:59:XX AM**: Found resolution link in error response body
- **8:59:XX AM**: Accessed factory resolution endpoint: https://pizza-factory.cs329.click/api/support/4a253a1c77e14bd3b0e8dcfcc594d434/report/926cije5
- **8:59:XX AM**: Factory confirmed: "Problem resolved. Pizza is back on the menu!"
- **9:03:XX AM**: Grafana alert auto-resolved (email received: "[RESOLVED] Non-200 StatusCode Alert")
- **9:03:XX AM**: Verified all subsequent orders succeeding with 200 status codes

## Root Cause
Chaos testing initiated via pizza-factory.cs329.click. The factory service activated a "chaos monkey" that intercepted all order fulfillment requests and returned 500 Internal Server Error responses with instructions for resolution.

**Specific chaos mechanism:** Factory-side order fulfillment failure returning error message with embedded resolution URL.

## Impact
- **Users Affected**: All users attempting to place orders during the ~7 minute window
- **Orders**: 100% of pizza orders failed during incident (estimated 12-14 failed order attempts)
- **Revenue Impact**: Minimal due to short duration
- **Peak Error Rate**: Every order attempt (100% failure rate)
- **Service Availability**: Service remained operational - only order fulfillment affected (no complete outage)
- **First Error**: 8:56:16 AM
- **Last Error**: ~8:59 AM
- **Auto-Resolution Confirmed**: 9:03 AM

## Detection

### Alert Configuration
- **Alert Name**: Non-200 StatusCode Alert
- **Alert Rule**: Monitors for any HTTP response with statusCode != 200
- **Evaluation Interval**: 1 minute
- **Alert Folder**: GrafanaCloud

### Alert Firing Details
**Email Received**: 8:58 AM (MST)  
**Subject**: [FIRING:2] Non-200 StatusCode Alert  
**First Observed**: 8:57:50 AM UTC (8:57:50 AM MST)  
**Instances Firing**: 2

**Alert Labels Captured**:
- `alertname`: Non-200 StatusCode Alert
- `authorized`: true
- `component`: jwt-pizza-service
- `detected_level`: error
- `level`: error
- `method`: POST
- `path`: /api/order
- `statusCode`: 500
- `type`: http
- `reqBody`: {"franchiseId":1,"storeId":1,"items":[{"menuId":1,"description":"Veggie","price":0.0038}]}
- `resBody`: Contains resolution link

**Alert Summary**: "Alert statusCode Not 200"

### Alert Resolution
**Email Received**: 9:03 AM (MST)  
**Subject**: [RESOLVED] Non-200 StatusCode Alert  
**Resolution Reason**: MissingSeries (no more 500 errors detected)  
**Instances Resolved**: 2  
**Total Alert Duration**: ~5 minutes 38 seconds

### Log Query Used for Investigation
```
{component="jwt-pizza-service"} | json | statusCode != "200"
```

This query immediately revealed:
- All errors were 500 status codes
- All errors on /api/order endpoint
- All errors contained chaos monkey message
- Resolution link embedded in every error response

## Response Actions
1. **8:56:16 AM** - First 500 error occurred (logged but alert not yet fired due to evaluation interval)
2. **8:57:50 AM** - Grafana alert evaluation detected pattern of non-200 responses
3. **8:58:00 AM** - Alert email received: "[FIRING:2] Non-200 StatusCode Alert"
4. **8:58:19 AM** - Acknowledged alert, opened Grafana dashboard
5. **8:58:XX AM** - Navigated to Grafana Explore
6. **8:58:XX AM** - Ran diagnostic query: `{component="jwt-pizza-service"} | json | statusCode = "500"`
7. **8:58:XX AM** - Identified chaos pattern - all /api/order POST requests failing with identical error
8. **8:58:50 AM** - Examined response body in logs, identified resolution instructions
9. **8:59:XX AM** - Extracted resolution URL from error message
10. **8:59:XX AM** - Accessed resolution endpoint in browser
11. **8:59:XX AM** - Factory API returned: "Problem resolved. Pizza is back on the menu!"
12. **9:00:XX AM** - Monitored dashboard - confirmed new orders succeeding
13. **9:03:XX AM** - Alert auto-resolved, confirmation email received

## Resolution
Chaos was resolved by accessing the factory-provided resolution endpoint embedded in the error responses. The factory's chaos monkey system automatically disabled the fault injection upon receiving the support request at the provided URL.

**Resolution method**: Accessed factory support endpoint  
**URL**: https://pizza-factory.cs329.click/api/support/4a253a1c77e14bd3b0e8dcfcc594d434/report/926cije5  
**Factory Response**: {"message":"Problem resolved. Pizza is back on the menu!"}  
**No code changes required**  
**No service restarts required**  
**Automatic resolution via factory API**

**Response time from alert to resolution**: ~1-2 minutes  
**Total incident duration**: ~7 minutes (from first error to confirmed resolution)  
**Within 4-hour SLA**: ✅ Yes (responded in <5 minutes)

## Error Details

**Complete Error Message Captured by Logging**:
```json
{
  "message": "Failed to fulfill order at factory: chaos monkey",
  "followLinkToEndChaos": "https://pizza-factory.cs329.click/api/support/4a253a1c77e14bd3b0e8dcfcc594d434/report/926cije5"
}
```

**Complete Failed Request Example from Logs**:
```json
{
  "authorized": true,
  "path": "/api/order",
  "method": "POST",
  "statusCode": 500,
  "reqBody": "{\"franchiseId\":1,\"storeId\":1,\"items\":[{\"menuId\":1,\"description\":\"Veggie\",\"price\":0.0038}]}",
  "resBody": "{\"message\":\"Failed to fulfill order at factory: chaos monkey\",\"followLinkToEndChaos\":\"https://pizza-factory.cs329.click/api/support/4a253a1c77e14bd3b0e8dcfcc594d434/report/926cije5\"}"
}
```

**Alert Email Content** (showing comprehensive label capture):
- Alert successfully captured all relevant metadata
- Request body preserved in alert labels for immediate diagnosis
- Response body with resolution instructions included in alert
- Status code, method, path all available without needing to query logs

## Lessons Learned

### What Went Well
- ✅ Alert system detected anomaly within 94 seconds of first error (excellent response time)
- ✅ Alert email included complete diagnostic information (request body, response body, status code)
- ✅ Comprehensive HTTP logging captured all request/response details including resolution instructions
- ✅ Dashboard provided clear visibility into error pattern, frequency, and timeline
- ✅ Resolution instructions were clearly communicated in standardized error format
- ✅ Factory-provided resolution link was straightforward and worked immediately
- ✅ Service architecture remained operational - only external dependency affected
- ✅ Alert auto-resolved when errors stopped, confirming monitoring validity
- ✅ Traffic simulation successfully generated continuous orders to trigger detection
- ✅ Response time from alert to resolution was well under SLA requirements

### What Could Be Improved
- Alert notification delay was ~38 seconds from first observation - could tune evaluation interval for faster notification
- Could implement automatic parsing of "followLinkToEndChaos" fields in error responses for automated resolution
- Could add factory health check endpoint monitoring to detect issues proactively before customer impact
- Alert description could include direct clickable link to resolution URL when present
- Could implement circuit breaker pattern to fail fast and provide better user experience during factory outages
- Dashboard could have dedicated panel for factory-specific errors
- Could add runbook link in alert for faster response procedure reference

### System Validation
This chaos test successfully validated:
1. ✅ Logging system captures complete debugging information with proper sanitization
2. ✅ Alert system responds within ~90 seconds of anomaly detection
3. ✅ Alert emails contain actionable diagnostic data without requiring log queries
4. ✅ Dashboard provides real-time visibility into service health
5. ✅ Response procedures are effective under simulated failure conditions
6. ✅ External service failure scenarios are detected, diagnosed, and resolved quickly
7. ✅ Alert auto-resolution confirms monitoring accuracy

## Action Items
- [ ] Review alert evaluation interval - consider reducing from 1m to 30s for faster notification
- [ ] Implement automated error message parsing for factory-provided resolution links
- [ ] Add factory service health monitoring dashboard panel with availability metrics
- [ ] Document factory chaos response procedures in operational runbook
- [ ] Consider implementing circuit breaker pattern with fallback messaging for factory failures
- [ ] Add retry logic with exponential backoff for transient factory errors
- [ ] Create alert template that auto-extracts and highlights resolution URLs when present
- [ ] Schedule quarterly chaos testing to validate monitoring effectiveness

## Supporting Evidence
- Alert Email 1: "[FIRING:2] Non-200 StatusCode Alert" received 8:58 AM
- Alert Email 2: "[RESOLVED] Non-200 StatusCode Alert" received 9:03 AM
- Screenshot: Grafana query showing multiple 500 errors (8:56-8:59 AM)
- Screenshot: Log entry with complete error details and resolution link
- Screenshot: Factory resolution confirmation message
- Screenshot: Dashboard showing error pattern spike and recovery
- Screenshot: Alert auto-resolution confirmation in dashboard

## Technical Notes
- Alert evaluation successfully detected pattern after ~90 seconds
- Alert correctly identified 2 firing instances (multiple failed requests)
- Alert labels captured complete request/response context for diagnosis
- Alert auto-resolved when error pattern ceased (MissingSeries reason)
- No false positives observed - legitimate scanner 404s did not trigger alert
- Factory chaos mechanism: Server-side order fulfillment interception returning 500
- Resolution mechanism: Accessing factory support endpoint disabled chaos injection
