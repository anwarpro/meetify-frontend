import type { CaptureOptionsBySource, ToggleSource } from '@livekit/components-core';
import * as React from 'react';
import { getSourceIcon } from '../assets/icons/util';
import { useTrackToggle } from '@livekit/components-react';
import { useSelector } from 'react-redux';

/** @public */
export interface TrackToggleProps<T extends ToggleSource>
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  source: T;
  showIcon?: boolean;
  initialState?: boolean;
  /**
   * Function that is called when the enabled state of the toggle changes.
   * The second function argument `isUserInitiated` is `true` if the change was initiated by a user interaction, such as a click.
   */
  onChange?: (enabled: boolean, isUserInitiated: boolean) => void;
  captureOptions?: CaptureOptionsBySource<T>;
}

/**
 * With the `TrackToggle` component it is possible to mute and unmute your camera and microphone.
 * The component uses an html button element under the hood so you can treat it like a button.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <TrackToggle source={Track.Source.Microphone} />
 *   <TrackToggle source={Track.Source.Camera} />
 * </LiveKitRoom>
 * ```
 * @public
 */
export const TrackToggle = /* @__PURE__ */ React.forwardRef(function TrackToggle<
  T extends ToggleSource,
>({ showIcon, ...props }: TrackToggleProps<T>, ref: React.ForwardedRef<HTMLButtonElement>) {
  const { buttonProps, enabled } = useTrackToggle(props);
  const { control: hostControl } = useSelector((state: any) => state.hostControl);
  const { userData } = useSelector((state: any) => state.auth);

  return (
    <button
      ref={ref}
      {...buttonProps}
      disabled={
        // @ts-ignore
        (buttonProps?.['data-lk-source'] === 'microphone' &&
          hostControl?.microphone &&
          userData.role === 'student') ||
        // @ts-ignore
        (buttonProps?.['data-lk-source'] === 'camera' &&
          hostControl?.camera &&
          userData.role === 'student') ||
        // @ts-ignore
        (buttonProps?.['data-lk-source'] === 'screen_share' &&
          hostControl?.screenShare &&
          userData.role === 'student')
      }
    >
      {(showIcon ?? true) && getSourceIcon(props.source, enabled)}
      {props.children}
    </button>
  );
});
