package org.twentyninek.app.cupcake.newarchitecture;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.io.IOException;

public class ReactVideoLooperManager extends SimpleViewManager<ReactVideoLooperView> {
  public static final String REACT_CLASS = "VideoLooper";
  ReactApplicationContext mCallerContext;

  public ReactVideoLooperManager(ReactApplicationContext reactContext) {
    mCallerContext = reactContext;
  }

  @Override
  public String getName() { return REACT_CLASS; }

  @Override
  public ReactVideoLooperView createViewInstance(ThemedReactContext context) {
    ReactVideoLooperView view = new ReactVideoLooperView(context);
    return view;
  }

  @ReactProp(name = "sources")
  public void setSources(ReactVideoLooperView view, ReadableArray sources) throws IOException {
    view.setSources(sources);
  }

  @ReactProp(name = "mutes")
  public void setMutes(ReactVideoLooperView view, ReadableMap mutes) throws IOException {
    view.setMutes(mutes);
  }

  @ReactProp(name = "repeat")
  public void setRepeat(ReactVideoLooperView view, boolean repeat) {
    view.setRepeat(repeat);
  }

  @ReactProp(name = "paused")
  public void setPaused(ReactVideoLooperView view, boolean paused) {
    view.setPaused(paused);
  }
  @ReactProp(name = "volume")
  public void setVolume(ReactVideoLooperView view, double volume) {
    view.setVolume(volume);
  }
  @ReactProp(name = "audioOnly")
  public void setAudioOnly(ReactVideoLooperView view, boolean audioOnly) {
    view.setAudioOnly(audioOnly);
  }
}
