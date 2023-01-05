/* eslint-disable @next/next/no-img-element */
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';

import UnlockMusicDialog from './UnlockDarkblockDialog';
import { useCallback, useEffect, useState } from 'react';
import AddToLibraryDialog from './AddToLibraryDialog';
import { fetchDarkBlockInfo } from '../lib/darkblock-helper';
import { LibraryItem } from '../lib/defs/library-item';
import { NFTItem } from '../lib/defs/nft-item';
import { usePrevious } from '../lib/use-previous';
import { arraysEqual } from '../lib/array-equals'
import { useMediaQuery } from '@mui/material';

function srcset(image: string, width: number, height: number, rows = 1, cols = 1) {
    return {
        src: `${image}?w=${width * cols}&h=${height * rows}&fit=crop&auto=format`,
        srcSet: `${image}?w=${width * cols}&h=${height * rows
            }&fit=crop&auto=format&dpr=2 2x`,
    };
}

export interface QuickNodeNftItem {
    name: string
    collectionName: string
    tokenAddress: string
    collectionAddress: string
    imageUrl: string
    chain: string
    description: string
}

export default function NFTImageList({ walletId, userId }: { walletId: string, userId: string }) {


    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedDarkBlock, setSelectedDarkBlock] = useState(null)
    const [imageData, setImageData] = useState(null as null | QuickNodeNftItem[])
    const [isLoading, setLoading] = useState(false)
    const [libraryItem, setLibraryItem] = useState(null as null | QuickNodeNftItem)
    const [libraryItems, setLibraryItems] = useState(null as LibraryItem[] | null)
    const prevLibraryItems = usePrevious({ libraryItems, setLibraryItems });
    const [libraryTokenKeys, setLibraryTokenKeys] = useState([] as any)
    const [libraryLoaded, setLibraryLoaded] = useState(false)
    const [libraryLoading, setLibraryLoading] = useState(false)
    const [removeLibItem, setRemoveLibItem] = useState(null as null | NFTItem)
    const [updatingData, setUpdatingData] = useState(false)
    const minWidthDesktop = useMediaQuery('(min-width: 768px)');
    const smallPhone = useMediaQuery('screen and (max-width: 600px)')

    useEffect(() => {
        if (isLoading || imageData) {
            return;
        }
        setLoading(true)
        fetch('/api/vault/' + walletId)
            .then((res) => res.json())
            .then((data) => {
                setImageData(data)
                setLoading(false)
            })
    }, [isLoading, setLoading, walletId, imageData])


    const fetchUserLibrary = useCallback(async () => {
        fetch('/api/library/')
            .then((res) => res.json())
            .then((data) => {
                console.log('initial loading of the library', data)
                setLibraryItems(data.content)
                setLibraryLoaded(true)
                setLibraryLoading(false)

            }).catch(e => {
                console.error('unable to load library', e)
                setLibraryItems([])
                setLibraryLoaded(true)
                setLibraryLoading(false)
            })
    }, [])


    // eslint-disable-next-line react-hooks/exhaustive-deps
    const delayedFetchUserLibrary = useCallback(
        debounce(() => fetchUserLibrary(), 500),
        [libraryLoading, userId, libraryLoaded, fetchUserLibrary]
    );

    useEffect(() => {
        if (libraryLoading || libraryLoaded || !userId) {
            return;
        }
        setLibraryLoading(true)

        // call the function
        delayedFetchUserLibrary()

    }, [libraryLoading, userId, libraryLoaded, fetchUserLibrary, delayedFetchUserLibrary])

    useEffect(() => {
        const keys: any = {}
        if (libraryItems) {
            libraryItems.forEach((lib) => keys[lib.tokenId] = true)
        }
        setLibraryTokenKeys(keys)
    }, [libraryItems])

    useEffect(() => {

        if (!libraryLoaded) {
            return;
        }
        // declare the data fetching function
        const fetchData = async () => {

            if (!libraryItem || !libraryItem.tokenAddress) {
                return
            }
            const darkblockInfo = await fetchDarkBlockInfo(libraryItem.tokenAddress)
            console.log(darkblockInfo)

            let hasSupportedDarkblock = false
            // if dbstack contains encrypted(audio/mpeg) assets ask user if they want to unlock music
            darkblockInfo.dbstack.forEach((stack: any) => {
                if (stack.data.type === 'encrypted(audio/mpeg)') {
                    hasSupportedDarkblock = true
                }
            })

            if (hasSupportedDarkblock) {
                setSelectedDarkBlock(darkblockInfo)
            }

            // setLibraryItem(null)
        }

        // call the function
        fetchData()
            // make sure to catch any error
            .catch(console.error);




    }, [libraryItem, libraryLoaded])


    useEffect(() => {

        if (updatingData || libraryLoading || !libraryLoaded || !userId) {
            return;
        }

        if (!prevLibraryItems || prevLibraryItems.libraryItems === libraryItems || (prevLibraryItems.libraryItems?.length === 0 && !libraryItems)) {
            return;
        }

        // declare the data fetching function
        const updateData = async () => {

            console.log('updateData', 'updatingData', updatingData, ' prevLibraryItems.libraryItems?', prevLibraryItems.libraryItems, 'libraryItems', libraryItems, 'libraryLoading', libraryLoading, 'libraryLoaded', libraryLoaded, 'userId', userId)
            fetch('/api/library', {
                method: "POST",
                credentials: 'same-origin', // include, *same-origin, omit
                body: JSON.stringify({
                    id: userId,
                    content: libraryItems
                })
            })
                .then((res) => res.json())
                .then((data) => {
                    // setImageData(data)
                    setUpdatingData(false)
                })



            // setLibraryItem(null)
        }


        if ((!prevLibraryItems.libraryItems &&  libraryItems)|| 
            prevLibraryItems.libraryItems && libraryItems && !arraysEqual(prevLibraryItems.libraryItems, libraryItems)) {
            setUpdatingData(true)
            updateData()
                // make sure to catch any error
                .catch(console.error);
            // process here
        }

        // call the function





    }, [libraryItems, libraryLoading, libraryLoaded, userId, updatingData, prevLibraryItems])


    // const addTodo = useCallback(() => {
    //     setTodos((t) => [...t, "New Todo"]);
    //   }, [newLibItems]);

    const addNewLib = useCallback((newLibItems: LibraryItem[]) => {
        if (!newLibItems) {
            return;
        }
        let newLib = [] as LibraryItem[]
        const libraryItemsTmp = libraryItems || []
        if (newLibItems && newLibItems.length > 0) {
            newLib = libraryItemsTmp.concat(newLibItems);
        }
        setLibraryItems(newLib)
    }, [libraryItems])


    useEffect(() => {
        if (!removeLibItem) {
            return;
        }
        console.log('removeLibItem', removeLibItem, 'libraryItems', libraryItems)
        const libItemsTmp = libraryItems || []
        const newLibraryItems = libItemsTmp.filter((libItem) => libItem.tokenId != removeLibItem.tokenAddress)
        console.log('newLibraryItems', newLibraryItems)
        setLibraryItems(newLibraryItems);
        setRemoveLibItem(null)

    }, [removeLibItem, libraryItems])



    const onItemSelected = (item: any) => {
        console.log('item clicked', item)
        // remove item
        if (libraryTokenKeys && libraryTokenKeys[item.tokenAddress]) {
            // take item token address and remove it from 
            setRemoveLibItem(item)
        }
        if (libraryTokenKeys && !libraryTokenKeys[item.tokenAddress]) {
            setSelectedItem(item)
        }


    }

    const addToLibrary = () => {
        // send unlock request to wallet
        // is this a darkblock nft?
        // show spinner dialog while processing
        // does this nft have a darkblock?
        console.log('addToLibrary selectedItem', selectedItem)
        setLibraryItem(selectedItem)
        setSelectedItem(null)

    }

    const onUnlocked = (libItems: LibraryItem[]) => {
        addNewLib(libItems)
        setSelectedDarkBlock(null)

    }

    if (isLoading) return <p>Loading...</p>
    if (!imageData) return <p>No NFTs found</p>

    // TODO load more data after page 1 is loaded.
    // TODO add refresh button
    return (
        <>

            {(selectedDarkBlock && walletId && libraryItem) &&
                <UnlockMusicDialog nftInfo={libraryItem} item={selectedDarkBlock} walletId={walletId} onUnlocked={onUnlocked} onClose={() => setSelectedDarkBlock(null)}></UnlockMusicDialog>
            }
            {(selectedItem && walletId) &&
                <AddToLibraryDialog item={selectedItem} walletId={walletId} onSelected={addToLibrary} onClose={() => { setSelectedItem(null) }} />
            }

            {/**  TODO: handle how to buy music nfts education here*/}
            {imageData && imageData.length == 0 && <div>No NFTs found</div>}
           

            <ImageList
                sx={{
                    // width: 350,
                    // height: 450,
                    // Promote the list into its own layer in Chrome. This costs memory, but helps keeping high FPS.
                    transform: 'translateZ(0)',
                }}
                cols={imageData.length === 1 ? 1 : (smallPhone ? 1 : (minWidthDesktop ? 3 : 2))}
                // rowHeight={200}
                gap={1}

            >
                {imageData && imageData.length > 0 && imageData.map((item) => {
                    // const cols = item.featured ? 2 : 1;
                    // const rows = item.featured ? 2 : 1;
                    const cols = 1
                    const rows = 1
                    return (
                        <ImageListItem key={item.imageUrl} cols={cols} rows={rows}>
                            <img
                                {...srcset(item.imageUrl, 250, 200, rows, cols)}
                                alt={item.name}
                                loading="lazy"
                            />
                            <ImageListItemBar
                                sx={{
                                    background:
                                        'linear-gradient(to top, rgba(0,0,0,0.7) 0%, ' +
                                        'rgba(0,0,0,0.6) 70%, rgba(0,0,0,0) 100%)',
                                }}
                                title={item.name}
                                onClick={() => onItemSelected(item)}
                                position="bottom"
                                actionIcon={
                                    <IconButton
                                        disabled={libraryLoading}
                                        sx={{ color: 'white' }}
                                        aria-label={`star ${item.name}`}
                                    >
                                        {libraryTokenKeys && libraryTokenKeys[item.tokenAddress] && <MinusCircleOutlined />}
                                        {!libraryTokenKeys || !libraryTokenKeys[item.tokenAddress] && <PlusCircleOutlined alt="Add song to your playlist" />}

                                    </IconButton>
                                }
                                actionPosition="left"
                            />
                        </ImageListItem>
                    );
                })}
            </ImageList>
        </>
    );
}
