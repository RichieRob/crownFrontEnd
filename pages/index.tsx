import { darkTheme, lightTheme, Theme, SwapWidget } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css';
import {ethers} from 'ethers';
import React from 'react';
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import {abi as defaultabi} from '../abi/default';
import {abi as crownabi} from '../abi/crown';
import {abi as erc20abi} from '../abi/erc20';
import {abi as poapabi} from '../abi/erc20';
import {abi as hookabi} from '../abi/hook';
import Images from './images'
import { ValueOf } from 'next/dist/shared/lib/constants';
const baseUrl = 'https://picsum.photos/id/'
const MY_TOKEN_LIST = [
  {
  "name": "ERC20 token",
  "address": "0x545D4322C97046b9F73a3dF83839BEF34Af69dA5",
  "symbol": "GLD",
  "decimals": 18,
  "chainId": 5,
  "logoURI": "https://www.pngmart.com/files/1/Banana-Clip-Art-Free-PNG.png"
},
]

const NATIVE = 'NATIVE' ;
const GLD = '0x545D4322C97046b9F73a3dF83839BEF34Af69dA5';


const crownContractConfig = {
  address: '0xa71918311523e4aBdFf226BcDbe098278aAe43BD',
  abi: crownabi,
};

const defaultContractConfig = {
  address: '0xaE98f7a5e4ffeBfaE83253a0828D7dFB1e579d4F',
  abi: defaultabi,
};

const erc20ContractConfig = {
  address : '0x545D4322C97046b9F73a3dF83839BEF34Af69dA5',
  abi: erc20abi,
}

const poapContractConfig = {
  address : '0xc53ce751333C816077CDF860b2e1c772A34662A5',
  abi: poapabi,
}

const hookContractConfig = {
  address : '0x79C72FAe82DBE14Ce10415E243561141eA6eC847',
  abi: hookabi,
}


const POAP = new ethers.Contract( '0x255f6d7880D25F5d41eA02bF55D6604456Dd7c8d' , poapabi )





const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [salePrice, setSalePrice] = React.useState('0');
  const [owner, setOwner] = React.useState('');
  const [erc20Balance, setErc20Balance] = React.useState('');
  const [poapBalance, setPoapBalance] = React.useState<number>(0);
  const [tokenIds , setTokenIds] = React.useState<{ key: number; value: string }[]>();
  const [tokenId,setTokenId]=React.useState('5');
  const [erc20Array,setErc20Array]=React.useState<{ key: number; value: string }[]>();
  const [address1, setAddress1]=React.useState<`0x${string}`>('0x0000000000000000000000000000000000000000');
  const banana = 'banana';

  const { isConnected, address, isConnecting, isDisconnected }= useAccount();
  setAddress1(address||'0x0000000000000000000000000000000000000000');

  const { config: crownContractWriteConfig } = usePrepareContractWrite({
    ...crownContractConfig,
    functionName: 'superPurchase',
    overrides: {
      value: ethers.utils.parseEther(salePrice),
      gasLimit: ethers.BigNumber.from('1500000'),
    },
  });

  const { data: burnData, isLoading: isBurning, isSuccess: isBurnStarted, write: burn, error: burnError }= useContractWrite({
    ...hookContractConfig,
    mode: 'recklesslyUnprepared',
    functionName: 'burnPoapAndClaimTokens',
    overrides: {
      gasLimit: ethers.BigNumber.from('500000'),
    },
    abi:[{
      inputs: [
        {
          internalType: "uint256",
          name: "_POAPID",
          type: "uint256",
        },
      ],
      name: "burnPoapAndClaimTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },],
  });


  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(crownContractWriteConfig);


  const { data: nextSalePriceData } = useContractRead({
    ...crownContractConfig,
    functionName: 'nextSalePrice',
    watch: true,
  });


  const { data: erc20BalanceData } = useContractRead({
    ...erc20ContractConfig,
    functionName: 'balanceOf',
    args: [address1],
    watch: true,
  });

  const { data: ownerData } = useContractRead({
    ...crownContractConfig,
    functionName: 'ownerOf',
    args: [ethers.BigNumber.from('0')],
    watch: true,
  });
  
  const { data: poapData } = useContractRead({
    ...poapContractConfig,
    functionName: 'balanceOf',
    args: [address1],
    watch: true,
  });

  const { data: poapTokenData } = useContractRead({
    ...poapContractConfig,
    functionName: 'getTokensHeld',
    abi:[{
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "getTokensHeld",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },],
    args: [address1],
    watch: true,
  });

  const { data: poapErc20Data } = useContractRead({
    ...poapContractConfig,
    functionName:'getErc20Array',
    abi:[{
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "getErc20Array",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },],
    args: [address1],
    watch: true,
  });


  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const {
    data: txData1,
    isSuccess: txSuccess1,
    error: txError1,
  } = useWaitForTransaction({
    hash: burnData?.hash,
  });

  
  
  React.useEffect(() => {
    if (nextSalePriceData) {
      setSalePrice(ethers.utils.formatEther(nextSalePriceData));
      
    }
  }, [nextSalePriceData]);

  React.useEffect(() => {
    if (ownerData) {
        setOwner(ownerData);
   
      }
  }, [ownerData])

  React.useEffect(() => {
    if (erc20BalanceData) {
      setErc20Balance(ethers.utils.formatEther(erc20BalanceData));
     
      }
  }, [erc20BalanceData])

  React.useEffect(() => {
    if (poapData) {
      setPoapBalance(poapData.toNumber());
        }  
  }, [poapData])

  //update this so it builds an array of objects which hold the Id, url, and value in erc20
  React.useEffect(() => {
    if(poapTokenData) {
      let _poapTokenDataArray = [];
      for(var i=0;i<poapTokenData.length;i++){
      _poapTokenDataArray.push({ key: i, value: poapTokenData[i].toString()});
      setTokenIds(_poapTokenDataArray);
    }
  }
  },[poapTokenData])

  React.useEffect(() => {
    if(poapErc20Data) {
      let _poapErc20DataArray = [];
      for(var i=0;i<poapErc20Data.length;i++){
        _poapErc20DataArray.push({key: i, value: ethers.utils.formatEther(poapErc20Data[i])});
        setErc20Array(_poapErc20DataArray);
    }
  }
  },[poapErc20Data])




  async function doTheClicky (something: string) {
    setTokenId(something)
    burn?.({
      recklesslySetUnpreparedArgs: [ethers.BigNumber.from(something)],
    
    })
  }



  const isMinted = txSuccess;
  const isBurned = txSuccess1;



  return (
    <div className={styles.container}>
      <Head>
        <title>RainbowKit App</title>
        <meta
          name="description"
          content="Generated by @rainbow-me/create-rainbowkit"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        

        <h1 className={styles.title}>
          The Crown Project 
        </h1>

        <p className={styles.description}>
          This site is still in alpha.
          </p>
          <div className={styles.grid} style={{ marginBottom: 24 }}>
          <a href="https://mirror.xyz/richierob.eth/lQNsetAPCO9xpLZdSKrJMhX9tI9pzAHpY-Rts40ewAw" className={styles.card}>
            <h2>Mirror.xyz Article &rarr;</h2>
            <p>Find our more about what this is all about</p>
          </a>
          </div>
        
        {/* crown contract section */}
        {mounted && isConnected&&!(address === owner) && (<p className={styles.description}>
         The current owner of The Crown is {owner}
        </p>
        )}

        {mounted && isConnected&&(address === owner) && (<p className={styles.description}>
          WELCOME DEAR LEADER <br></br>You are the current owner of The Crown! 
        </p>
        )}
         <React.Fragment>  <img src={'https://t4.ftcdn.net/jpg/02/04/25/71/360_F_204257104_jnqWGXAbNuyORkJG9yw9tdfutvkmJblt.jpg'} /></React.Fragment>

        {mounted && isConnected && (<p className={styles.description}>
          The current price to purchase The Crown is {salePrice} ETH
        </p>
        )}

        {mounted && isConnected && !(address===owner) && (
              <button
                style={{ marginBottom: 24 }}
                disabled={!mint || isMintLoading || isMintStarted}
                className="button"
                data-mint-loading={isMintLoading}
                data-mint-started={isMintStarted}
                onClick={() => mint?.()}
              >
                {isMintLoading &&  'Confirm  in your wallet'}
                {isMintStarted && 'Purchasing...'}
                {!isMintLoading && !isMintStarted &&'Purchase'}
              </button>
            )}


          {/* defi section */}
        
         {mounted && isConnected && (<p className={styles.description}>
         
          You have {poapBalance} Membership NFT{!(poapBalance===1) && 's'} 
        </p>
        )}

        
       
        {mounted && isConnected && tokenIds && (tokenIds.map((Id) => (
          <p key = {Id.key} className={styles.description}>
            Membership Id: {Id.value}<br></br>value : {erc20Array[Id.key].value} Gold
             <br></br> 
            <React.Fragment>  <img src={baseUrl+Id.value+'/300'} /></React.Fragment>
            <br></br>
            Burn to recieve {erc20Array[Id.key].value} Gold
            <br></br><button
                style={{ marginBottom: 50 }}
                disabled={!burn || isBurning || isBurnStarted}
                className="button"
                data-mint-loading={isBurning&&(tokenId===Id.value)}
                data-mint-started={isBurnStarted&&(tokenId===Id.value)}
                onClick={() =>
                  doTheClicky(Id.value)
                }
              > {((!isBurning&&!isBurnStarted)|| !(tokenId===Id.value) )&& 'Burn Membership'}
              {isBurning && (tokenId===Id.value) &&'Confirm Burn '+Id.value}
              {isBurnStarted && (tokenId===Id.value) &&'Burning POAP '+Id.value}
            </button>
            </p>
        )))}  
        {mounted && isConnected && (<p className={styles.description}>
          Your current gold balance is {erc20Balance}
          <br></br>
          Buy and sell gold with Uniswap here: 
        </p>
        )}
        
        <div className="Uniswap">
      {mounted && isConnected && (<SwapWidget  tokenList={MY_TOKEN_LIST} theme = {darkTheme}  defaultInputTokenAddress={NATIVE}
     
      defaultOutputTokenAddress={GLD} />
      )}
      </div>
      
        

        <div className={styles.grid} style={{ marginTop: 24 }}>
          <a href="https://discord.gg/ZptSx3dT" className={styles.card}>
            <h2>Discord &rarr;</h2>
            <p>Join our discord to make all your hopes and dreams come true.</p>
          </a>
          </div>

          {/* <a href="https://wagmi.sh" className={styles.card}>
            <h2>wagmi Documentation &rarr;</h2>
            <p>Learn how to interact with Ethereum.</p>
          </a>

          <a
            href="https://github.com/rainbow-me/rainbowkit/tree/main/examples"
            className={styles.card}
          >
            <h2>RainbowKit Examples &rarr;</h2>
            <p>Discover boilerplate example RainbowKit projects.</p>
          </a>

          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Next.js Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Next.js Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div> */}
      </main>

      {/* <footer className={styles.footer}>
        <a href="https://rainbow.me" target="_blank" rel="noopener noreferrer">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer> */}
    </div>
  );
};

export default Home;
