import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

// TODO make item typed
// Unlock and add music to user music list -- just add for now
export default function AddToLibraryDialog({item, walletId, onClose, onSelected}: {item:any, walletId:string, onClose:Function, onSelected:Function}) {
  const [open, setOpen] = useState(true);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleAddToLibrary = () => {
    setOpen(false)
    onSelected(item)
  };

  const handleClose = () => {
    onClose()
  };

  
  return (
    <div>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open responsive dialog
      </Button> */}
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
        Add {item && item.name} to library?
        </DialogTitle>
        <DialogContent>
        
          {/* <DialogContentText>
            Please unlock my Darkblocks?
          </DialogContentText> */}

          <DialogContentText>
         Would you like to add this NFT music to your library?
          </DialogContentText>
          
          
        </DialogContent> 
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleAddToLibrary} autoFocus>
            Add to Library
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}