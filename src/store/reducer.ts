import { UserProfile } from "../scripts/chaincodeInterface";

export interface NetworkState {
  IPFS: boolean;
  FABRIC: boolean;
}

export interface AppState {
  userProfile?: UserProfile;
  network: NetworkState;
}

export const initialState: AppState = {
  network: {
    IPFS: false,
    FABRIC: false,
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
        userProfile: action.payload
      };
    case "updateNetwork":
      return {
        ...state,
        network: {
          ...state.network,
          ...action.payload
        }
      }
  }

  return state;
}
