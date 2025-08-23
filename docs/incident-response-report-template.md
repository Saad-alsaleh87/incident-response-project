# Incident Response Report Template

## Incident Summary
- **Incident ID**: [Auto-generated or assigned]
- **Date/Time Detected**: [Timestamp when incident was first detected]
- **Date/Time Resolved**: [Timestamp when incident was resolved]
- **Severity Level**: [Critical/High/Medium/Low]
- **Status**: [Open/Investigating/Resolved/Closed]

## Incident Description
[Provide a clear, concise description of what happened]

## Detection Method
### Monitoring Tools Used
- **GCP Monitoring**: [Describe which metrics alerted]
- **GCP Logging**: [Describe which log entries indicated the issue]
- **Custom Alerts**: [Describe any custom alerting configured]

### Initial Indicators
- [List the first signs of the incident]
- [Include metric values, log entries, or user reports]

### Alert Timeline
- **First Alert**: [Timestamp and source]
- **Escalation**: [How the alert was escalated]
- **Response Time**: [Time from detection to first response]

## Root Cause Analysis
### Primary Cause
[Identify the main cause of the incident]

### Contributing Factors
[List any factors that contributed to the incident]

### Technical Details
[Provide technical details about the failure]

## Impact Assessment
### Affected Services
- [List all services impacted]
- [Describe the extent of impact]

### User Impact
- [Number of users affected]
- [Type of impact (performance degradation, outage, etc.)]

### Business Impact
- [Financial impact if applicable]
- [Reputation impact]
- [Compliance impact]

## Response Actions Taken
### Immediate Response
- [List immediate actions taken to contain the incident]
- [Include timestamps for each action]

### Investigation Steps
- [Detail the investigation process]
- [Include tools and methods used]

### Resolution Steps
- [Describe how the incident was resolved]
- [Include any code changes, configuration updates, etc.]

## Lessons Learned
### What Went Well
[Identify aspects of the response that worked well]

### What Could Be Improved
[Identify areas for improvement in monitoring, alerting, or response]

### Recommendations
[Specific recommendations for preventing similar incidents]

## Follow-up Actions
### Short-term (Next 24-48 hours)
- [ ] [Action item]
- [ ] [Action item]

### Medium-term (Next week)
- [ ] [Action item]
- [ ] [Action item]

### Long-term (Next month)
- [ ] [Action item]
- [ ] [Action item]

## Metrics and Data
### Performance Metrics During Incident
- **CPU Utilization**: [Values]
- **Memory Usage**: [Values]
- **Response Time**: [Values]
- **Error Rate**: [Values]

### Recovery Metrics
- **Time to Detect**: [Duration]
- **Time to Respond**: [Duration]
- **Time to Resolve**: [Duration]
- **Total Downtime**: [Duration]

## Attachments
- [ ] Screenshots of monitoring dashboards
- [ ] Log excerpts
- [ ] Configuration files
- [ ] Incident timeline
- [ ] Post-incident analysis

---

**Report Prepared By**: [Name]
**Date**: [Date]
**Next Review Date**: [Date]

---

## Example Incident Response Report

### Incident Summary
- **Incident ID**: INC-2024-001
- **Date/Time Detected**: 2024-01-15 14:30:00 UTC
- **Date/Time Resolved**: 2024-01-15 15:45:00 UTC
- **Severity Level**: High
- **Status**: Resolved

### Incident Description
During routine testing of the incident response simulation, a CPU stress test was activated that caused sustained high CPU utilization for 2 minutes, leading to increased response times and temporary service degradation.

### Detection Method
#### Monitoring Tools Used
- **GCP Monitoring**: CPU utilization metric exceeded 80% threshold
- **GCP Logging**: Log entry "CPU stress test activated" was detected
- **Custom Alerts**: High CPU usage alert triggered

#### Initial Indicators
- CPU utilization spiked from 15% to 95%
- Response latency increased from 50ms to 500ms
- Error rate increased slightly due to timeout issues

### Root Cause Analysis
#### Primary Cause
Intentional CPU stress test activation via `/api/admin/cpu-stress` endpoint during incident response simulation testing.

#### Contributing Factors
- Stress test was configured to run for 2 minutes
- No automatic throttling of stress test intensity
- Monitoring thresholds were set appropriately for detection

### Impact Assessment
#### Affected Services
- Order API service experienced increased response times
- Frontend application showed slower page loads
- Database queries experienced slight delays

#### User Impact
- 0 users affected (test environment)
- Simulated user experience showed 10x increase in response times

### Response Actions Taken
#### Immediate Response
- 14:32:00 - Incident detected via GCP Monitoring alert
- 14:32:15 - Investigation began by reviewing logs
- 14:33:00 - Identified CPU stress test as cause
- 14:33:30 - Monitored stress test completion

#### Resolution Steps
- 15:45:00 - Stress test completed automatically
- 15:45:30 - System performance returned to normal
- 15:46:00 - Verified all metrics returned to baseline

### Lessons Learned
#### What Went Well
- Monitoring detected the incident within 2 minutes
- Logging provided clear indication of the cause
- System automatically recovered after stress test completion

#### What Could Be Improved
- Add automatic stress test duration limits
- Implement circuit breakers for extreme stress conditions
- Add more granular monitoring during stress tests

### Recommendations
1. Implement maximum stress test duration limits
2. Add real-time stress test monitoring dashboard
3. Create automated rollback mechanisms for stress tests
4. Enhance alerting to distinguish between real incidents and test scenarios

### Follow-up Actions
#### Short-term
- [ ] Review and adjust stress test parameters
- [ ] Update monitoring thresholds based on test results

#### Medium-term
- [ ] Implement stress test safety mechanisms
- [ ] Create incident response playbook

#### Long-term
- [ ] Conduct regular incident response drills
- [ ] Implement chaos engineering practices
