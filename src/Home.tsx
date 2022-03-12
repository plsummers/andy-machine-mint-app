import { useEffect, useState } from "react";
import styled from "styled-components";
import { Container, Snackbar } from "@material-ui/core";
import Paper from '@material-ui/core/Paper';
import Alert from "@material-ui/lab/Alert";

import * as anchor from "@project-serum/anchor";

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import { GatewayProvider } from '@civic/solana-gateway-react';
import { Header } from './Header';
import { MintButton } from './MintButton';

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  shortenAddress,
  CANDY_MACHINE_PROGRAM,
} from "./candy-machine";

import {
  AlertState,
  getAtaForMint,
} from "./utils";

const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, ##0185c6 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
  display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    position: relative;
  `;

const MintContainer = styled.div`
    justify-content: center;
    align-items: center;
    position: relative;
`; // add your styles here

export interface HomeProps {
  candyMachineId: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

  const [itemsAvailable, setItemsAvailable] = useState(0);
  const [itemsRedeemed, setItemsRedeemed] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const wallet = useAnchorWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const rpcUrl = props.rpcHost;

  const refreshCandyMachineState = () => {
    (async () => {
      console.log("refresh cm");
      if (!wallet) return;

      const cndy = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );

      console.log(cndy);
      setCandyMachine(cndy);

      setItemsAvailable(cndy.state.itemsAvailable);
      setItemsRemaining(cndy.state.itemsRemaining);
      setItemsRedeemed(cndy.state.itemsRedeemed);

      // fetch whitelist token balance
      if (cndy.state.whitelistMintSettings) {
        setWhitelistEnabled(true);
        let balance = 0;
        try {
          const tokenBalance =
            await props.connection.getTokenAccountBalance(
              (
                await getAtaForMint(
                  cndy.state.whitelistMintSettings.mint,
                  wallet.publicKey,
                )
              )[0],
            );

          balance = tokenBalance?.value?.uiAmount || 0;
        }
        catch (e) {
          console.error(e);
          balance = 0;
        }

        setWhitelistTokenBalance(balance);
      }
      else {
        setWhitelistEnabled(false);
      }
    })();
  };

  const onMint = async () => {
    try {
      setIsMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            'singleGossip',
            true,
          );
        }

        if (!status?.err) {
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x138')) {
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);

  const SOLETTERSImage = styled("img")`
    width: 100%;
    height: 480px;
    object-fit: cover;
    object-position: top;
    margin-bottom: 30px;
    border-radius: 5%;
  `
  
  return (
    <main>
    <Container style={{ marginTop: 100 }}>
    <Container maxWidth="xs" style={{ position: 'relative' }}>
      <SOLETTERSImage src="/example.gif" alt="solettersimage"/>
      <Paper style={{ padding: 24, background: 'linear-gradient(180deg, ##ff0082 0%, ##1f1d1e 100%)', borderRadius: 6 }}>
        {!wallet ? (
          <ConnectButton>Connect Wallet</ConnectButton>) : 
        
        (
          <>
            <Header candyMachine={candyMachine} />
            <MintContainer>
              {candyMachine?.state.isActive &&
              candyMachine?.state.gatekeeper &&
              wallet.publicKey &&
              wallet.signTransaction ? (
                <GatewayProvider
                  wallet={{
                    publicKey:
                      wallet.publicKey ||
                      new PublicKey(CANDY_MACHINE_PROGRAM),
                    //@ts-ignore
                    signTransaction: wallet.signTransaction,
                  }}
                  gatekeeperNetwork={
                    candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                  }
                  clusterUrl={rpcUrl}
                  options={{ autoShowModal: false }}
                >
                  <MintButton
                    candyMachine={candyMachine}
                    isMinting={isMinting}
                    onMint={onMint}
                  />
                </GatewayProvider>
              ) : (
                <MintButton
                  candyMachine={candyMachine}
                  isMinting={isMinting}
                  onMint={onMint}
                />
              )}
            </MintContainer>
          </>


        )}
      </Paper>
    </Container>

    <Snackbar
      open={alertState.open}
      autoHideDuration={6000}
      onClose={() => setAlertState({ ...alertState, open: false })}
    >
      <Alert
        onClose={() => setAlertState({ ...alertState, open: false })}
        severity={alertState.severity}
      >
        {alertState.message}
      </Alert>
    </Snackbar>
  </Container>
    </main>
  );
};

export default Home;
