import { setupParticipantName } from '@livekit/components-core';
import { UseParticipantInfoOptions, useEnsureParticipant } from '@livekit/components-react';
import * as React from 'react';
import { mergeProps } from '../mergeProps';
import Image from 'next/image';
import SvgParticipantPlaceholder from '../assets/images/ParticipantPlaceholder';
import { Box } from '@mui/material';
import { useObservableState } from '../hooks/useObservableState';

/** @public */
export interface ParticipantNameProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    UseParticipantInfoOptions {};

export interface ParticipantNameProps
    extends React.HTMLAttributes<HTMLSpanElement> 
    {
      layoutName: string;
    }

/**
 * The `ParticipantName` component displays the name of the participant as a string within an HTML span element.
 * If no participant name is undefined the participant identity string is displayed.
 *
 * @example
 * ```tsx
 * <ParticipantName />
 * ```
 * @public
 */
export const ParticipantPlaceholder = /* @__PURE__ */ React.forwardRef<
  HTMLSpanElement,
  ParticipantNameProps
>(function ParticipantPlaceholder({ participant, layoutName, ...props }: ParticipantNameProps, ref) {
  const p = useEnsureParticipant(participant);

  const { className, infoObserver } = React.useMemo(() => {
    return setupParticipantName(p);
  }, [p]);

  const { identity, name, metadata } = useObservableState(infoObserver, {
    name: p.name,
    identity: p.identity,
    metadata: p.metadata,
  });

  //   const mergedProps = React.useMemo(() => {
  //     return mergeProps(props, { className, 'data-lk-participant-name': name });
  //   }, [props, className, name]);

  return (
    <Box sx={{ borderRadius: '50%' }} ref={ref}>
      {(metadata?.includes('profileImage') || metadata === "") ? (
        layoutName==="carousel" ? <SvgParticipantPlaceholder width={100}
        height={100}/> : <SvgParticipantPlaceholder width={150}
        height={150}/>
      ) : (
        layoutName==="carousel" ? <Image src={metadata!} width={80} height={80} alt="" /> 
        :
        <Image src={metadata!} width={150} height={150} alt="" />
      )}
      {/* {props.children} */}
    </Box>
  );
});
