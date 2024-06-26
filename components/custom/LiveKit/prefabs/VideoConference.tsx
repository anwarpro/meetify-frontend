import * as React from 'react';
import type {
  MessageDecoder,
  MessageEncoder,
  TrackReferenceOrPlaceholder,
  WidgetState,
} from '@livekit/components-core';
import { isEqualTrackRef, isTrackReference, isWeb, log } from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';

import {
  CarouselLayout,
  ConnectionStateToast,
  FocusLayoutContainer,
  LayoutContextProvider,
  MessageFormatter,
  RoomAudioRenderer,
  useCreateLayoutContext,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
} from '@livekit/components-react';
import { useWarnAboutMissingStyles } from '../hooks/useWarnAboutMissingStyles';
import { FocusLayout, GridLayout } from '../layout';
import { ParticipantTile } from '../participant/ParticipantTile';
import { ControlBar } from './ControlBar';
import { Chat } from './Chat';
import { Participant } from './Participant';
import { useSelector } from 'react-redux';
import { usePinnedTracks } from '../hooks/usePinnedTracks';
import { useRouter } from 'next/router';
import meetService from '../../../../service/meet/meetService';
import attendanceService from '../../../../service/attendance/attendanceService';
import CustomToastAlert from '../../CustomToastAlert';
import { HostControlModal } from './HostControlModal';
import { setControls } from '../../../../lib/Slicers/hostControllSlicer';
import { useDispatch } from 'react-redux';
import { isEqual } from 'lodash';

/**
 * @public
 */
export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  chatMessageEncoder?: MessageEncoder;
  chatMessageDecoder?: MessageDecoder;
  room: any;
  /** @alpha */
  SettingsComponent?: React.ComponentType;
}

/**
 * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
 * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
 * of participants, basic non-persistent chat, screen sharing, and more.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 * You can use this components as a starting point for your own custom video conferencing application.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 * @public
 */
export function VideoConference({
  chatMessageFormatter,
  chatMessageDecoder,
  chatMessageEncoder,
  room,
  SettingsComponent,
  ...props
}: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
    // @ts-ignore
    showParticipant: false,
  });
  const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  const widgetUpdate = (state: WidgetState) => {
    log.debug('updating widget state', state);
    setWidgetState(state);
  };

  // custom pin code
  const router = useRouter();
  const { name: roomName } = router.query as { name: string };
  const [remotePinEmail, setRemotePinEmail] = React.useState('no_email');
  const [selfPinEmail, setSelfPinEmail] = React.useState('no_self');
  const [openToast, setOpenToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const decoder = new TextDecoder();
  const dispatch = useDispatch();
  const { control } = useSelector((state: any) => state.hostControl);
  const { userData } = useSelector((state: any) => state.auth);

  const fetchPinData = () => {
    meetService
      .getPinInfo(roomName)
      .then((res: any) => {
        setRemotePinEmail(res.data?.data);
        setSelfPinEmail('no_self');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  room.on(
    RoomEvent.DataReceived,
    (payload: Uint8Array, participant: any, kind: string, topic: string) => {
      if (topic === 'pin_updated') {
        const email = JSON.parse(decoder.decode(payload));
        if (email.email !== remotePinEmail) {
          setRemotePinEmail(email.email);
          setSelfPinEmail('no_self');
        }
      }
      if (topic === 'hostControl') {
        const hostControlDecode = decoder.decode(payload);
        let parsedHostControl = JSON.parse(hostControlDecode);
        if (!isEqual(control, parsedHostControl.control)) {
          dispatch(setControls(parsedHostControl.control));
        }
      }
    },
  );

  React.useEffect(() => {
    if (room?.state === 'connected') {
      attendanceService
        .trackParticipantActivity({
          eventType: 'participant_joined',
          identity: room?.localParticipant?.identity,
          meetId: room?.roomInfo?.name,
        })
        .then((res) => console.log('Attendance Counted Joined'))
        .catch((err) => console.log('err', err));
    }
    if (room?.state === 'disconnected') {
      attendanceService
        .trackParticipantActivity({
          eventType: 'participant_left',
          identity: room?.localParticipant?.identity,
          meetId: room?.roomInfo?.name,
        })
        .then((res) => console.log('Attendance Counted Left'))
        .catch((err) => console.log('err', err));
    }
  }, [room.state]);

  React.useEffect(() => {
    if (roomName) {
      fetchPinData();
    }
  }, [roomName]);

  const layoutContext = useCreateLayoutContext();
  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  const focusTrack = usePinnedTracks(layoutContext, tracks, remotePinEmail, selfPinEmail)?.[0];
  const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

  React.useEffect(() => {
    // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      log.debug('Auto set screen share focus:', { newScreenShareTrack: screenShareTracks[0] });
      layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
      )
    ) {
      log.debug('Auto clearing screen share focus.');
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
      lastAutoFocusedScreenShareTrack.current = null;
    }
  }, [
    screenShareTracks
      .map((ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
      .join(),
    focusTrack?.publication?.trackSid,
  ]);

  useWarnAboutMissingStyles();
  const { isParticipantModalOpen, isChatOpen } = useSelector((state: any) => state.participant);
  const { isHostControlOpen } = useSelector((state: any) => state.participant);
  const [prevParticipants, setPrevParticipants] = React.useState<any>([]);
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();

  const checkPariticantJoined = () => {
    if (remoteParticipants.length > prevParticipants.length) {
      if (
        remoteParticipants.some(
          (np) =>
            np?.joinedAt &&
            localParticipant?.joinedAt &&
            new Date(np?.joinedAt) > new Date(localParticipant?.joinedAt),
        )
      ) {
        const newParticipants = remoteParticipants.filter(
          (pp: any) => !prevParticipants.some((rp: any) => rp?.identity === pp?.identity),
        );
        newParticipants?.sort((a, b) => {
          if (a.joinedAt && b.joinedAt && a.joinedAt > b.joinedAt) {
            return -1;
          } else if (a.joinedAt && b.joinedAt && a.joinedAt < b.joinedAt) {
            return 1;
          } else {
            return 0;
          }
        });
        setOpenToast(true);
        if (newParticipants.length > 1) {
          setToastMessage(
            `${newParticipants[0].name} and ${newParticipants.length - 1} others joined`,
          );
        } else {
          setToastMessage(`${newParticipants[0].name} joined`);
        }
        let audio = new Audio('/meet_join.mp3');
        audio.play();
      }
    } else if (remoteParticipants.length < prevParticipants.length) {
      const leftParticipants = prevParticipants.filter(
        (pp: any) => !remoteParticipants.some((rp) => rp.identity === pp?.identity),
      );
      setOpenToast(true);
      if (leftParticipants?.length > 1) {
        setToastMessage(
          `${leftParticipants[0]?.name} and ${leftParticipants?.length - 1} others left`,
        );
      } else {
        setToastMessage(`${leftParticipants[0]?.name} left`);
      }
    }
    setPrevParticipants(remoteParticipants);
  };

  React.useEffect(() => {
    checkPariticantJoined();
  }, [remoteParticipants]);

  return (
    <div className="lk-video-conference" {...props}>
      {isWeb() && (
        <LayoutContextProvider
          value={layoutContext}
          // onPinChange={handleFocusStateChange}
          onWidgetChange={widgetUpdate}
        >
          <div className="lk-video-conference-inner">
            {!focusTrack ? (
              <div className="lk-grid-layout-wrapper">
                <GridLayout tracks={tracks}>
                  <ParticipantTile
                    room={room}
                    remotePinEmail={remotePinEmail}
                    setRemotePinEmail={setRemotePinEmail}
                    selfPinEmail={selfPinEmail}
                    setSelfPinEmail={setSelfPinEmail}
                    layoutName="grid"
                  />
                </GridLayout>
              </div>
            ) : (
              <div className="lk-focus-layout-wrapper">
                <FocusLayoutContainer>
                  <CarouselLayout tracks={carouselTracks}>
                    <ParticipantTile
                      room={room}
                      remotePinEmail={remotePinEmail}
                      setRemotePinEmail={setRemotePinEmail}
                      selfPinEmail={selfPinEmail}
                      setSelfPinEmail={setSelfPinEmail}
                      layoutName="carousel"
                    />
                  </CarouselLayout>
                  {focusTrack && (
                    <FocusLayout
                      trackRef={focusTrack}
                      room={room}
                      remotePinEmail={remotePinEmail}
                      setRemotePinEmail={setRemotePinEmail}
                      selfPinEmail={selfPinEmail}
                      setSelfPinEmail={setSelfPinEmail}
                    />
                  )}
                </FocusLayoutContainer>
              </div>
            )}
          </div>
          <Participant
            // @ts-ignore
            style={{ display: isChatOpen ? 'none' : isParticipantModalOpen ? 'grid' : 'none' }}
          />
          {userData.role === 'admin' && (
            <HostControlModal
              // @ts-ignore
              style={{ display: isHostControlOpen ? 'grid' : 'none' }}
            />
          )}

          <ControlBar
            controls={{
              chat: true,
              settings: !!SettingsComponent,
              participant: true,
              hostControl: userData.role === 'admin' ? true : false,
            }}
          />
          <Chat
            style={{
              display: isParticipantModalOpen ? 'none' : isChatOpen ? 'grid' : 'none',
            }}
            messageFormatter={chatMessageFormatter}
            messageEncoder={chatMessageEncoder}
            messageDecoder={chatMessageDecoder}
          />

          {SettingsComponent && (
            <div
              className="lk-settings-menu-modal"
              style={{ display: widgetState.showSettings ? 'block' : 'none' }}
            >
              <SettingsComponent />
            </div>
          )}
          <CustomToastAlert
            open={openToast}
            setOpen={setOpenToast}
            duration={2000}
            status={'info'}
            message={toastMessage}
            vertical="top"
          />
        </LayoutContextProvider>
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
