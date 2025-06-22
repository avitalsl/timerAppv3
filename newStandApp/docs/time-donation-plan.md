# 🕒 Plan: Time Donation Feature

## 📝 Notes
- This plan is based on the user-provided feature design document.
- The implementation is divided into five phases: **Foundational Logic**, **State Management**, **UI Components**, **Testing**, and **User Roles and Permissions**.
- **Existing data structures in `MeetingContext.tsx` will be modified and merged with the new design, rather than creating separate model files.**
- Core logic will be encapsulated in a `meetingTimerService` for testability.
- State will be managed via `MeetingContext` and a reducer.
- The `donateTime` function in `meetingTimerService` should be refactored to return the complete updated state to ensure business logic is properly encapsulated.
- The `SpeakerProgressBar` component was deemed redundant and will be removed.
- The feature now uses a simplified user role model, distinguishing only between:
  - `'interactive'`: authenticated users (via Google)
  - `'viewOnly'`: participants added manually, cannot interact

> ℹ️ ViewOnly users are ephemeral and do not persist across sessions. They cannot donate time, trigger actions, or see interactive controls.

---

## ✅ Task List

### Phase 1: Foundational Logic and Data Structures
- [x] **Task 1.1: Update Data Models**
  - [x] Modify interfaces in `src/contexts/MeetingContext.tsx`.
  - [x] Merge in `Participant`, `TimeDonation`, and `MeetingState`.
- [x] **Task 1.2: Implement the Service Layer**
  - [x] Create `src/services/meetingTimerService.ts`.
  - [x] Implement:
    - `calculateTotalAvailableTime`
    - `calculateRemainingTime`
    - `canDonateTime`
    - `donateTime`
    - `moveToNextParticipant`
    - `skipParticipant`
    - `processTick`

---

### Phase 2: State Management with React Context
- [x] **Task 2.1: Refactor `meetingTimerService`**
  - [x] Ensure `donateTime` returns full updated `MeetingState`.
- [x] **Task 2.2: Enhance `MeetingContext`**
  - [x] Refactor `meetingReducer` to use service layer logic.
  - [x] Update `useMeetingTimer` to match new state logic.

---

### Phase 3: User Interface Components
- [x] **Task 3.1: Create New UI Components**
  - [x] `ParticipantTimeCard.tsx`
  - [x] `TimeDonationModal.tsx`
    - [x] Basic modal structure
    - [x] Donation input
    - [x] Submission + closing logic
- [ ] **Task 3.2: Integrate Components**
  - [ ] Replace `<li>` in `ParticipantListWidget.tsx` with `ParticipantTimeCard`.
  - [ ] Add controls for donating and skipping.

---

### Phase 4: Testing and Validation
- [x] **Task 4.1: Fix Compilation Issues**
  - [x] Update mocks in `*.test.tsx` files.
  - [x] Fix all model imports.
- [ ] **Task 4.2: Unit Test the Service**
  - [ ] Add test coverage for `meetingTimerService.ts`.
- [ ] **Task 4.3: UI Tests**
  - [ ] Add tests for new components.
- [ ] **Task 4.4: Test Integration**
  - [ ] Finalize `ParticipantListWidget.test.tsx`.

---

### Phase 5: User Roles and Permissions
- [ ] **Task 5.1: Define User Data Types**
  - [ ] In `src/types/userTypes.ts`, define:
    ```ts
    export const USER_TYPES = ['interactive', 'viewOnly'] as const;
    ```
  - [ ] Update `AppUser` to include the role.
- [ ] **Task 5.2: Update User Context**
  - [ ] Detect role at session start (authenticated vs. added manually).
  - [ ] Expose this via `UserContext.tsx`.
- [ ] **Task 5.3: Role-Based UI Controls**
  - [ ] In `ParticipantTimeCard.tsx`, hide/disable action buttons for `viewOnly` users.
  - [ ] Render readonly mode for participants with no permissions.
- [ ] **Task 5.4: Role-Based Tests**
  - [ ] Ensure permission rules are enforced in both UI and logic.

---

## 🎯 Current Goal
**Update user data types and integrate role awareness throughout the app.**You should comment, girl