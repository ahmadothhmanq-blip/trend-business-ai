export type TbdpValidationIssue = {
  code: string;
  message: string;
  path?: string;
};

export type TbdpValidationResult = {
  valid: boolean;
  issues: TbdpValidationIssue[];
};
