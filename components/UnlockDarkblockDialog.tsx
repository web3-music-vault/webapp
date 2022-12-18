import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { auth } from '../lib/darkblock-helper';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession } from 'next-auth/react';
import { LibraryItem } from '../lib/defs/library-item';

function removeExtension(filename:string): string {
  return filename.substring(0, filename.lastIndexOf('.')) || filename;
}

// Unlock and add music to user music list -- just add for now
export default function UnlockMusicDialog({ nftInfo, item, walletId, onClose, onUnlocked }: { nftInfo: any, item: any, walletId: string, onClose: Function, onUnlocked: Function }) {
  const [open, setOpen] = useState(true);
  const { signMessage, publicKey } = useWallet();
  const { data: session } = useSession()
  const [unlocking, setUnlocking] = useState(false);
  const [unlockLibItems, setUnlockLibItems] = useState(null as LibraryItem[] | null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // when there are unlockable libs save them and close dialog
  // after dialog is closed need to change icon to show minus sign to remove from library
  // we will need user id, nft token id, unlockable items and we will be merging all items together
  // which will support query get me my nfts

  useEffect(() => {
    if(unlockLibItems && unlockLibItems.length > 0){
      onUnlocked(unlockLibItems)
      setOpen(false)
    }
   
  },[onUnlocked, unlockLibItems])

  useEffect(() => {

    if(!(session?.user as any)?.id){
      throw new Error('No user Id session setup')
    }
    const userId = (session?.user as any).id
    // declare the data fetching function
    const fetchData = async () => {

      if (!unlocking || !item || !signMessage) {
        return
      }
      const unlockOn = Date.now()
      const epoch = unlockOn + ''

      try {
        // const owner = item.darkblock.owner.address
        const owner = walletId;
        // for each item in darkblock stack create a url
        let platform = 'Solana'
        if (nftInfo.chain === 'SOL') {
          platform = 'Solana'
        }
        
        // const ownerLowerCase = owner.toLowerCase()
        const sign = await auth(epoch, owner,publicKey, signMessage as Function)
        // TODO reuse signing for multiple unlocks
        // 
        console.log('nftInfo', nftInfo)
        console.log('authInfo', sign)
        // TODO make it easier to reuse
        const session_token = `${epoch}_${sign}_${platform}`
        // const session_token = `1670098106398_${sign}_${platform}`
        const token_id = nftInfo.tokenAddress

        const stack = item.dbstack


        const itemsForLib:LibraryItem[] = []
        stack.forEach((darkBlockFile: any) => {
          // find artId
          let artId: string = '';
          let name: string = ''
          let url: string;
          const tags = darkBlockFile.tags;
          const type = darkBlockFile.data.type
          // console.log('darkblockFile.tags', darkBlockFile.tags)
          tags.forEach((tag: any) => {
            if (tag.name === 'ArtId') {
              artId = tag.value;
            }
            if (tag.name === 'Name') {
              name = removeExtension(tag.value)
            }
            // create darkblock gateway url

        
          });

          // only support mp3 for now
          if (type !== 'encrypted(audio/mpeg)') {
            return;
          }


          if(!artId){
            throw new Error('Unknown artifact Id (artId)')
          }

          // url = `https://gateway.darkblock.io/proxy?artid=${artId}&session_token=${session_token}&token_id=${token_id}&contract=&platform=Solana&owner=8DjbKo9ik74KQ1sKx83xAx6D1sKz2riws75oXxDFeEc`
          url = `${process.env.NEXT_PUBLIC_DARKBLOCK_GATEWAY}proxy?artid=${artId}&session_token=${session_token}&token_id=${token_id}&contract=&platform=${platform}&owner=${owner}`

          // setUnlockLink(url)
          // remove suffix 
          if(!name){
            console.error('No name provided', )
          }
          itemsForLib.push({
            tokenId: token_id,
            platform: platform,
            // need to use userid vs wallet .. to handle multiple chains
            walletId,
            userId,
            unlockedOn: unlockOn,
            mimeType: type as string,
            title: name,
            // TODO  QuickNode service is returning Unknown? for collection name this is important for singles? for now collection == nft name
            collection: nftInfo.name as string,
            // TODO add metadata so we can see image data on devices that show images not just audio
            // metadata: {

            // }
            url
          })

          console.log(url)

        })

        console.log('itemsForLib', JSON.stringify(itemsForLib))
        // create a list of objects --
        // {
        //   title: 'On the Block', // from darkblock
        //   collection: "Meta Versus", // from nft collection or nft name? if they are the same just skip collection? we can make collection optional
        //   image: 'nft image url'
        //   url: 'https://gateway.darkblock.io/proxy?artid=2585f7b3-fc0b-4baf-8442-59ef1c1b4c24&session_token=1667772800317_0xdf42681aedc69a526129a707d0a7788293add1c66c6178c240c1b98cd5c1d0c170088974e10d74f3df3aec50c9818be9a155546d62323a9575b50f5081de2daa1b&token_id=1&contract=0x3a29f9f90ea83893b70ed7725afab758d9779acb&platform=Polygon&owner=0x552b7200c91239d82aa96a762bc196472458f8b7',
        // },
        setUnlockLibItems(itemsForLib)
        setUnlocking(false)
      } catch (error) {
        console.error(error)
      }

    }

    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);


  }, [item, nftInfo, publicKey, session?.user, signMessage, unlocking, walletId])

  const handleUnlock = () => {
    // send unlock request to wallet
    // is owner
    onUnlocked()
  };



  const unlockDarkblock = () => {
    setUnlocking(true)
  }

  // use effect 
  // take the darkblock item
  // ask for wallet auth
  // later add spinner / progress window

  const handleClose = () => {
    setOpen(false)
    onClose()
  };
  // setup auth using db utility

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
          Unlock {item && item.name} content?
        </DialogTitle>
        <DialogContent>

          {/* <DialogContentText>
            Please unlock my Darkblocks?
          </DialogContentText> */}

          <DialogContentText>
            This NFT has un-lockable darkblock content. You must authenticate to unlock!
            A message will be sent to your web3 wallet asking for a signature to confirm ownership.

            {/* {(unlockLink !== null) && <a href={unlockLink} target="_top">Content</a>} */}
          </DialogContentText>


        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Don&apos;t unlock
          </Button>
          <Button onClick={unlockDarkblock} autoFocus>
            Unlock
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}