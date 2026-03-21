# TODO: Make phone no, OTP/code fields numeric-only

- [ ] Create TODO.md (done)
- [x] Edit Frontend/src/App.jsx: Update InputField type/pattern/inputMode for:
  | Field | Changes |
  |-------|---------|
  | mobile, landline, witness_mobile | type="tel" pattern="[0-9+ ]*" inputMode="numeric"
  | regional_code | type="tel" pattern="[0-9]*" inputMode="numeric"
  | aadhaar | type="number" pattern="[0-9]{12}" inputMode="numeric"
  | pin_corr, pin_perm | type="number" pattern="[0-9]{6}" inputMode="numeric" 
  | account_no | type="tel" pattern="[0-9]*" inputMode="numeric"
  | micr | type="number" pattern="[0-9]{9}" inputMode="numeric"
  | ifsc | pattern="[A-Z]{4}0[A-Z0-9]{6}" maxlength="11"

- [x] Add JS numeric filter in handleInputChange for pure-number fields.
- [x] Test: cd Frontend && npm run dev; verify inputs reject letters.
- [x] Update TODO.md with progress.
- [ ] attempt_completion

