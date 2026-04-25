import auditLogsService from "../services/auditLogsService";

export const buildAuditChanges = (
  action: string,
  entity: string,
  oldObj: any,
  newObj: any
) => {
  const changes: any[] = [];

  // CREATE
  if (!oldObj && newObj) {
    Object.keys(newObj).forEach((key) => {
      changes.push({
        ActionType: action,
        EntityName: entity,
        FieldName: key,
        OldValue: null,
        NewValue: newObj[key]?.toString() ?? null,
      });
    });
  }

  // DELETE
  else if (oldObj && !newObj) {
    Object.keys(oldObj).forEach((key) => {
      changes.push({
        ActionType: action,
        EntityName: entity,
        FieldName: key,
        OldValue: oldObj[key]?.toString() ?? null,
        NewValue: null,
      });
    });
  }

  // UPDATE
  else if (oldObj && newObj) {
    for (const key of Object.keys(newObj)) {
      if (oldObj[key] !== newObj[key]) {
        changes.push({
          ActionType: action,
          EntityName: entity,
          FieldName: key,
          OldValue: oldObj[key]?.toString() ?? null,
          NewValue: newObj[key]?.toString() ?? null,
        });
      }
    }
  }

  return changes;
};

export const logAudit = async (
  action: string,
  entity: string,
  oldValue: any,
  newValue: any,
  organizationID: number,
  user: string,
  screenName: string
) => {
  try {
    const auditArray = buildAuditChanges(action, entity, oldValue, newValue);

    if (auditArray.length === 0) return;

    await auditLogsService.PostGenerateLoginsAsync({
      AuditJson: JSON.stringify(auditArray),
      TraceID: crypto.randomUUID(),
      IPAddress: "0.0.0.0", // TODO: get real IP
      UserAgent: navigator.userAgent,
      OrganizationID: organizationID,
      UpdatedBy: user,
      ScreenName: screenName,
    });
  } catch (err) {
    console.error("Audit failed:", err);
  }
};

export const fireAudit = (...args: Parameters<typeof logAudit>) => {
  void logAudit(...args);
};