import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import TextField from "@mui/material/TextField";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface PasswordDialogProps {
  password: string;
  open: boolean;
  onCancel: () => void;
  onOkay: () => void;
  onPasswordChange: (password: string) => void;
}

export default function PasswordDialog({
  password,
  open,
  onCancel,
  onOkay,
  onPasswordChange,
}: PasswordDialogProps) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        slots={{
          transition: Transition,
        }}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Enter Password"}</DialogTitle>
        <DialogContent dividers>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length === 4) onOkay();
            }}
          >
            <TextField
              label="Password"
              value={password}
              type="password"
              error={password.length !== 4}
              helperText={
                password.length !== 4 ? "Password must be 4 digits" : ""
              }
              slotProps={{
                input: {
                  inputProps: {
                    maxLength: 4,
                  },
                },
              }}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onOkay} disabled={password.length !== 4}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
