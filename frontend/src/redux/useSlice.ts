import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  unseenActivitiesCount: number;
}

const initialState: UserState = {
  unseenActivitiesCount: 0,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUnseenActivitiesCount: (state, action: PayloadAction<number>) => {
      state.unseenActivitiesCount = action.payload;
    },
  },
});

export const { setUnseenActivitiesCount } = userSlice.actions;

export default userSlice.reducer;
