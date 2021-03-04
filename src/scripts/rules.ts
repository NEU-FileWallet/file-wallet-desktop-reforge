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

export const notEmpty: Rule = async (input) => {
  if (!input) return { result: false, msg: "This part can not be empty" };
  return { result: true };
};

export const websocketURL: Rule = async (input) => {
  const result = /(ws|wss):\/\/([\w.]+\/?)\S*/.test(input || "");
  if (!result)
    return { result, msg: "It doesn't seems like a valid websocket address." };
  return { result };
};
