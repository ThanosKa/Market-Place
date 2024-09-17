import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  unseenActivitiesCount: number;
  unreadChatsCount: number;
}

const initialState: UserState = {
  unseenActivitiesCount: 0,
  unreadChatsCount: 0,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUnseenActivitiesCount: (state, action: PayloadAction<number>) => {
      state.unseenActivitiesCount = action.payload;
    },
    setUnreadChatsCount: (state, action: PayloadAction<number>) => {
      state.unreadChatsCount = action.payload;
    },
  },
});

export const { setUnseenActivitiesCount, setUnreadChatsCount } =
  userSlice.actions;

export default userSlice.reducer;
