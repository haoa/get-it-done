import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-client-preset'
import 'antd/dist/antd.css';
import { LocaleProvider } from 'antd';
import deDE from 'antd/lib/locale-provider/de_DE';

const httpLink = new HttpLink({ uri: 'http://localhost:4000' })

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <LocaleProvider locale={deDE}>
      <App />
    </LocaleProvider>
  </ApolloProvider>, 
  document.getElementById('root')
)
registerServiceWorker()