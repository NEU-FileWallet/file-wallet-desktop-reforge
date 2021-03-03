export interface FileMeta {
  cid: string;
  cipher: string;
  name: string;
  createDate: number;
}

export interface SubscriberMeta {
  id: string;
  DueDate: string;
}

export interface Directory {
  name: string;
  directories: string[];
  files: FileMeta[];
  creator: string;
  editor: string;
  date: number;
  cooperators: string[];
  subscribers: SubscriberMeta[];
  deleted: boolean;
  idNameMap?: { [ley: string]: string };
  visibility: string;
}

export interface UserProfile {
  id: string;
  name: string;
  private: string;
}

export interface ChaincodeInterface {
  readUserName: (id: string) => Promise<string>;
  initiateUserProfile: (name: string) => Promise<UserProfile>;
  readUserProfile: () => Promise<UserProfile | undefined>;

  createDirectory: (name: string, visibility: string) => Promise<string>;
  readDirectory: (key: string) => Promise<Directory>;
  readDirectories: (keys: string[]) => Promise<{ [key: string]: Directory }>;
  addDirectories: (
    parentKey: string,
    childrenKeys: string[]
  ) => Promise<Directory>;
  removeDirectories: (
    parentKey: string,
    childrenKeys: string[]
  ) => Promise<Directory>;
  renameDirectory: (parentKey: string, name: string) => Promise<Directory>;
  addFile: (directoryKey: string, files: FileMeta[]) => Promise<Directory>;
  removeFile: (directoryKey: string, names: string[]) => Promise<Directory>;
  setDirectoryVisibility: (
    directoryKey: string,
    visibility: string
  ) => Promise<Directory>;
  readDirectoryHistory: (directoryKey: string) => Promise<Directory[]>;
  copyDirectory: (sourceKey: string, destinationKey: string) => Promise<void>;

  addSubscribers: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void>;
  addCooperators: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void>;
  removeSubscribers: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void>;
  removeCooperators: (
    directoryKey: string,
    ids: string[],
    recursive: boolean
  ) => Promise<void>;
  subscribe: (key: string) => Promise<Directory>;
}
