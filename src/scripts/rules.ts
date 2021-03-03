

export type Rule = (
    input: string | undefined
  ) => Promise<{ result: boolean; msg?: string }>;

export const folderNameRules: Rule[] = [
    async (input) => {
      if (!input) {
        return {
          result: false,
          msg: "The folder name can not be empty.",
        };
      }
  
      if (input.length > 64) {
        return {
          result: false,
          msg: "The folder name is too long.",
        };
      }
      return { result: true };
    },
  ];
  