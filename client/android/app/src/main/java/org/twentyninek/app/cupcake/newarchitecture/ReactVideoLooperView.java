package org.twentyninek.app.cupcake.newarchitecture;

import android.content.Context;
import android.graphics.Matrix;
import android.media.AudioManager;
import android.os.Handler;
import android.view.TextureView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.ExoPlayer;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.Player;
import com.google.android.exoplayer2.analytics.AnalyticsListener;
import com.google.android.exoplayer2.audio.AudioAttributes;
import com.google.android.exoplayer2.ext.okhttp.OkHttpDataSource;
import com.google.android.exoplayer2.source.DefaultMediaSourceFactory;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.ProgressiveMediaSource;
import com.google.android.exoplayer2.upstream.DefaultLoadErrorHandlingPolicy;
import com.google.android.exoplayer2.upstream.cache.CacheDataSource;
import com.google.android.exoplayer2.video.VideoSize;

import java.io.IOException;
import java.util.HashMap;

import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;

enum ReactEvents {
  EVENT_ON_START_END("onStartEnd"),
  EVENT_ON_END("onEnd"),
  EVENT_ON_READY_FOR_DISPLAY("onReadyForDisplay"),
  EVENT_ON_TRANSITION("onTransition");

  private final String mName;

  ReactEvents(final String name) {
    mName = name;
  }

  @Override
  public String toString() {
    return mName;
  }
}
public class ReactVideoLooperView extends TextureView {
  private class Listener implements AnalyticsListener {
    @Override
    public void onVideoSizeChanged(EventTime eventTime, VideoSize videoSize) {
      AnalyticsListener.super.onVideoSizeChanged(eventTime, videoSize);
      scaleVideoSize(videoSize.width, videoSize.height);
    }

    @Override
    public void onMediaItemTransition(EventTime eventTime, @Nullable MediaItem mediaItem, int reason) {
      AnalyticsListener.super.onMediaItemTransition(eventTime, mediaItem, reason);
      if (mediaItem == _startMediaItem) {
        sendEvent(_themedReactContext, ReactEvents.EVENT_ON_START_END.toString());
      } else if (mediaItem == _endMediaItem) {
        //_player.setVolume(_mutes.getOrDefault("end", false) ? 0.0f : 1.0f);
      }
      else if (reason != Player.MEDIA_ITEM_TRANSITION_REASON_REPEAT) {
        sendEvent(_themedReactContext, ReactEvents.EVENT_ON_TRANSITION.toString());
      }
    }

    @Override
    public void onPlaybackStateChanged(EventTime eventTime, int state) {
      AnalyticsListener.super.onPlaybackStateChanged(eventTime, state);
      if (state == Player.STATE_READY) {
        if (_startMediaItem != null) {
          //_player.setVolume(_mutes.getOrDefault("start", false) ? 0.0f : 1.0f);
        } else if (_loopMediaItem != null) {
          //_player.setVolume(_mutes.getOrDefault("loop", false) ? 0.0f : 1.0f);
        }

        sendEvent(_themedReactContext, ReactEvents.EVENT_ON_READY_FOR_DISPLAY.toString());
      }
      if (state == Player.STATE_ENDED) {
        sendEvent(_themedReactContext, ReactEvents.EVENT_ON_END.toString());
      }
    }
  }
  private ThemedReactContext _themedReactContext;
  private ExoPlayer _player;
  private AudioManager _audioManager;
  private Listener _listener;
  private HashMap<String, Boolean> _mutes;
  private MediaItem _startMediaItem;
  private MediaItem _loopMediaItem;
  private MediaItem _endMediaItem;
  private boolean _repeat;
  private int minLoadRetryCount = 3;

  public ReactVideoLooperView(ThemedReactContext context) {
    super(context);
    _themedReactContext = context;
    initializeMediaPlayer();
    _audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
  }

  private void sendEvent(ThemedReactContext reactContext,
                         String eventName) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, null);
  }

  private OkHttpDataSource.Factory createOkHttpFactory() {
    OkHttpClient client = new OkHttpClient.Builder().build();
    OkHttpDataSource.Factory factory = new OkHttpDataSource.Factory((Request r) -> client.newCall(r));
    //CacheDataSource.Factory cacheFactory = new CacheDataSource.Factory().setUpstreamDataSourceFactory(factory);
    return factory;
  }

  private void initializeMediaPlayer() {
    if (_player == null) {
      AudioAttributes audioAttributes = new AudioAttributes.Builder()
        .setUsage(C.USAGE_MEDIA)
        .setContentType(C.AUDIO_CONTENT_TYPE_MOVIE)
        .setAllowedCapturePolicy(C.ALLOW_CAPTURE_BY_ALL)
        .build();
      _player = new ExoPlayer.Builder(_themedReactContext)
        .setMediaSourceFactory(new DefaultMediaSourceFactory(createOkHttpFactory()))
        .setAudioAttributes(audioAttributes, true)
        .build();
      _listener = new Listener();
      _player.addAnalyticsListener(_listener);
    }
  }

  private void requestAudioFocus() {
    _audioManager.requestAudioFocus(new AudioManager.OnAudioFocusChangeListener() {
        @Override
        public void onAudioFocusChange(int focusChange) {
          switch (focusChange) {
            case AudioManager.AUDIOFOCUS_LOSS:
              _player.pause();
              _audioManager.abandonAudioFocus(this);
              break;
            default:
              break;
          }

          if (_player != null) {
            if (focusChange ==  AudioManager.AUDIOFOCUS_GAIN) {
                _player.setVolume(1.0f);
              }
            }
          }
      },
      AudioManager.STREAM_MUSIC,
      AudioManager.AUDIOFOCUS_GAIN);
  }
  public void setSources(ReadableMap sources) throws IOException {
    ReactVideoLooperView self = this;
    new Handler().postDelayed(new Runnable() {
      @Override
      public void run() {
        String startSource = sources.getString("start");
        String loopSource = sources.getString("loop");
        String endSource = sources.getString("end");

        //DataSource.Factory dataSourceFactory = new DefaultDataSource.Factory(self._themedReactContext);
        OkHttpDataSource.Factory okHttpDataSourceFactory = createOkHttpFactory();

        if (startSource != null) {
          self._startMediaItem = MediaItem.fromUri(startSource);
          MediaSource startMediaSource =
            new ProgressiveMediaSource.Factory(okHttpDataSourceFactory)
              .setLoadErrorHandlingPolicy(new DefaultLoadErrorHandlingPolicy(minLoadRetryCount))
              .createMediaSource(self._startMediaItem);
          self._player.addMediaSource(startMediaSource);
        }
        if (loopSource != null) {
          self._loopMediaItem = MediaItem.fromUri(loopSource);
          MediaSource loopMediaSource =
            new ProgressiveMediaSource.Factory(okHttpDataSourceFactory)
              .setLoadErrorHandlingPolicy(new DefaultLoadErrorHandlingPolicy(minLoadRetryCount))
              .createMediaSource(self._loopMediaItem);
          self._player.addMediaSource(loopMediaSource);
        }
        if (endSource != null) {
          self._endMediaItem = MediaItem.fromUri(endSource);
          MediaSource endMediaSource =
            new ProgressiveMediaSource.Factory(okHttpDataSourceFactory)
              .setLoadErrorHandlingPolicy(new DefaultLoadErrorHandlingPolicy(minLoadRetryCount))
              .createMediaSource(self._endMediaItem);
          self._player.addMediaSource(endMediaSource);
        }

        if (self._startMediaItem == null && self._loopMediaItem != null && self._repeat) {
          self._player.setRepeatMode(Player.REPEAT_MODE_ONE);
        }

        self._player.setVideoTextureView(self);
        self._player.prepare();
        self._player.setPlayWhenReady(true);
        self._player.setVolume(1.0f);
        //self.requestAudioFocus();
      }
    }, 1);

  }

  public void setMutes(ReadableMap mutes) {
    _mutes = new HashMap<String, Boolean>();
    _mutes.put("start", mutes.getBoolean("start"));
    _mutes.put("loop", mutes.getBoolean("loop"));
    _mutes.put("end", mutes.getBoolean("end"));
  }

  public void setRepeat(boolean repeat) {
    _repeat = repeat;
    if (repeat && _loopMediaItem != null) {
      _player.setRepeatMode(Player.REPEAT_MODE_ONE);
    } else {
      _player.setRepeatMode(Player.REPEAT_MODE_OFF);
    }
  }

  public void setPaused(boolean paused) {
    if (paused) {
      _player.pause();
    } else {
      _player.play();
    }
  }

  private void scaleVideoSize(int videoWidth, int videoHeight) {
    if (videoWidth == 0 || videoHeight == 0) {
      return;
    }

    Size viewSize = new Size(getWidth(), getHeight());
    Size videoSize = new Size(videoWidth, videoHeight);
    ScaleManager scaleManager = new ScaleManager(viewSize, videoSize);
    Matrix matrix = scaleManager.getScaleMatrix(ScalableType.CENTER_CROP);
    if (matrix != null) {
      setTransform(matrix);
    }
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    if (_player != null) {
      _player.removeAnalyticsListener(_listener);
      _player.release();
      _player = null;
      _listener = null;
    }
  }
}
