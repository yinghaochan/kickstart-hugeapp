import MainApp from './MainApp';
import TodoApp from 'TodoApp/client';
import AdminApp from 'AdminApp/client';
import ReduxWrapper from './reduxWrapper.jsx'
import { createHistory } from 'history'
import { Provider } from 'react-redux'


// Setup the singleton store based on environment
import { persistState } from 'redux-devtools'
import { compose, createStore, applyMiddleware } from 'redux'
import { syncHistory } from 'redux-simple-router'
import thunk from 'redux-thunk'

import DevTools from './dev/devTools'
import reducers from '_redux/reducers'

Meteor.startup(() => {
  const history = createHistory()

  const clientOptions = {
    wrapper: ReduxWrapper,
    history: history,
    createReduxStore: (initialState, history) => {
      
      // sync dispatched route actions to history
      const historyMiddleware = syncHistory(history)
      let finalCreateStore
      let store

      // Implement store with redux devtools in dev environment only
      if (process.env.NODE_ENV !== 'production' && !process.env.IS_MIRROR) {
        finalCreateStore = compose(
          // Enable middleware:
          applyMiddleware(historyMiddleware, thunk),
          // Enable devtools:
          DevTools.instrument(),

          // Lets you write ?debug_session=<name> in address bar to persist debug sessions
          // persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
        )(createStore);
      } else {
        finalCreateStore = applyMiddleware(historyMiddleware, thunk)(createStore)
      }

      store = finalCreateStore(reducers)
      // window.store = store
      historyMiddleware.listenForReplays(store)

      return store
    }
  }

  const serverOptions = {
    ...clientOptions,
  }

  ReactRouterSSR.Run({
    component: MainApp,
    childRoutes: [
      TodoApp,
      AdminApp
    ]
  }, clientOptions, serverOptions);


})


