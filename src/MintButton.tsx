import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { CandyMachine } from './candy-machine';
import { CircularProgress } from '@material-ui/core';
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import { useEffect, useState } from 'react';
import Countdown from "react-countdown";
import {
    toDate,
} from './utils';

export const CTAButton = styled(Button)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`; // add your styles here

export const CounterText = styled.span``; // add your styles here

export const MintButton = ({
    onMint,
    candyMachine,
    isMinting,
}: {
    onMint: () => Promise<void>;
    candyMachine: CandyMachine | undefined;
    isMinting: boolean;
}) => {
    const { requestGatewayToken, gatewayStatus } = useGateway();
    const [clicked, setClicked] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isActive, setIsActive] = useState(false); // true when countdown completes

    useEffect(() => {
        setIsVerifying(false);
        if (gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION && clicked) {
            // when user approves wallet verification txn
            setIsVerifying(true);
        }
        else if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
            console.log('Verified human, now minting...');
            onMint();
            setClicked(false);
        }
    }, [gatewayStatus, clicked, setClicked, onMint]);

    return (
        <CTAButton
            disabled={
                candyMachine?.state.isSoldOut ||
                isMinting ||
                !isActive ||
                isVerifying
            }
            onClick={async () => {
                if (isActive && candyMachine?.state.gatekeeper && gatewayStatus !== GatewayStatus.ACTIVE) {
                    console.log('Requesting gateway token');
                    setClicked(true);
                    await requestGatewayToken();
                } else {
                    console.log('Minting...');
                    await onMint();
                }
            }}
            variant="contained"
        >
            {!candyMachine ? (
                "CONNECTING..."
            ) : candyMachine?.state.isSoldOut ? (
                'SOLD OUT'
            ) : isActive ? (
                isVerifying ? 'VERIFYING...' :
                    isMinting ? (
                        <CircularProgress />
                    ) : (
                        "MINT"
                    )
            ) : (candyMachine?.state.goLiveDate ? (
                <Countdown
                    date={toDate(candyMachine?.state.goLiveDate)}
                    onMount={({ completed }) => completed && setIsActive(true)}
                    onComplete={() => {
                        setIsActive(true);
                    }}
                    renderer={renderCounter}
                />
            ) : (
                "UNAVAILABLE"
            ))}
        </CTAButton>
    );
};

const renderCounter = ({ days, hours, minutes, seconds }: any) => {
    return (
        <CounterText>
            {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
        </CounterText>
    );
};
