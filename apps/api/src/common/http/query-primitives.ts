import { IsDateString, IsEnum, IsUUID, Matches } from 'class-validator';

export function IsUtcDateString() {
  return (target: object, propertyKey: string) => {
    Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?Z$/)(
      target,
      propertyKey,
    );
    IsDateString({ strict: true })(target, propertyKey);
  };
}

export function IsUuid7() {
  return IsUUID('7');
}

export function IsExplicitEnum(entity: object) {
  return IsEnum(entity);
}
