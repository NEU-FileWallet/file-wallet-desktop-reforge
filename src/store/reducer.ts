import { UserProfile } from "../scripts/chaincodeInterface";
import { AppConfig } from "../scripts/config";

export interface NetworkState {
  IPFS: boolean;
  FABRIC: boolean;
  peerAmount: number;
}

export interface AppState {
  userProfile?: UserProfile;
  network: NetworkState;
  config?: AppConfig;
}

export const initialState: AppState = {
  network: {
    IPFS: false,
    FABRIC: false,
    peerAmount: 0,
  },
};

interface UpdateAction {
  type: string;
  payload: any;
}

export function AppReducer(
  state: AppState = initialState,
  action: UpdateAction
): AppState {
  switch (action.type) {
    case "updateUserProfile":
      return {
        ...state,
        userProfile: action.payload,
      };
    case "updateNetwork":
      return {
        ...state,
        network: {
          ...state.network,
          ...action.payload,
        },
      };
    case "updateConfig":
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };
  }

  return state;
}
