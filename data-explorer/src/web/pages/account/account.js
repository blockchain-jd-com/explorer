import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { observable, computed, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import nj from 'nornj';
import { registerTmpl } from 'nornj-react';
import { autobind } from 'core-decorators';
import { tranBase58 } from '../../../utils/util';
import AccountInfo from '../../components/accountInfo';
import AccountRootHash from '../../components/accountRootHash';
import MonacoEditor from 'react-monaco-editor';
import { Drawer } from 'antd';
import 'flarej/lib/components/antd/table';
import 'flarej/lib/components/antd/input';
import 'flarej/lib/components/antd/button';
import 'flarej/lib/components/antd/pagination';
import 'flarej/lib/components/antd/tabs';
import 'flarej/lib/components/antd/tree';
import 'flarej/lib/components/antd/checkbox';
import KvCount from '../../components/kvcount';
import Modal from 'flarej/lib/components/antd/modal';
import Tree from 'flarej/lib/components/antd/tree';
import Input from 'flarej/lib/components/antd/input';
import Message from 'flarej/lib/components/antd/message';
import Notification from '../../../utils/notification';
import styles from './account.m.scss';
import tmpls from './account.t.html';
import {fetchData} from "../../../utils/fetchConfig";

//页面容器组件
@registerTmpl('Account')
@inject('store')
@observer
export default class Account extends Component {
  @observable detailModalVisible = false;
  @observable inputRole = '';
  @observable detailData = [];
  @observable selectedRowKeys = [];
  @observable selectedRows = [];
  @observable pageSize = 10;
  @observable show = false;
  @observable accountData = {};
  @observable accountAddress = '';
  @observable visible = false;
  @observable mvalsearch = '';
  @observable mvalresult = '';
  @observable m = {};
  componentDidMount() {
    const { store: { header } } = this.props;
    header.setSelectMenu(['account']);
    this.Search();
  }

  // 执行穿透式检索
  @autobind
  onClickExec() {
    const { store: { account } } = this.props;
    const closeLoading = Message.loading('正在执行...', 0);
    Promise.all([
      account.getSchemaInfo(this.mvalsearch)
    ]).then((e) => {
      closeLoading(); 
      this.mvalresult = JSON.stringify(e[0]);
      this.m.trigger('anyString','editor.action.formatDocument',{})
    });
  }
  
  @autobind
  editorDidMount(monaco) {
    this.m = monaco;
  }

  Search() {
    const { store: { account } } = this.props;
    const closeLoading = Message.loading('正在获取数据...', 0);
    let leaders = this.props.store.common.getDefaultLedger(),
      param = {
        fromIndex: (account.accountcurrent - 1) * this.pageSize,
        count: this.pageSize,
      }
    Promise.all([
      account.getAccountCount(leaders)
    ]).then(() => {
      if (account.accountcount > 0) {
        Promise.all([account.getAccounts(leaders,
          param
        ),
        ]).then(() => {
          closeLoading();
        });
      }
      else {
        closeLoading();
      }
    });
  }
  SearchVague() {
    const { store: { account } } = this.props;
    const closeLoading = Message.loading('正在获取数据...', 0);
    let leaders = this.props.store.common.getDefaultLedger(),
      keyword = this.accountAddress,
      param = {
        fromIndex: (account.accountcurrent - 1) * this.pageSize,
        count: this.pageSize,
        keyword
      }
    Promise.all([
      account.getAccountCountVague(leaders, keyword)
    ]).then(() => {
      if (account.accountcount > 0) {
        Promise.all([account.getAccountVague(leaders,
          param
        ),
        ]).then(() => {
          closeLoading();
        });
      }
      else {
        closeLoading();
      }
    });
  }
  //模糊查询
  @autobind
  SerchInfo() {
    if (this.accountAddress.trim() != '') {
      this.SearchVague();
    }
    else {
      this.Search()
    }
  }

  // 穿透式检索
  @autobind
  starSerchInfo() {
    this.visible = !this.visible;
  }
  //代码编辑器
  @autobind
  onMonacoChange(e) {
    this.mvalsearch = e;
  }
  @autobind
  onMonacoResultChange(e){
    this.mvalresult=e;
  }
  @autobind
  onChangeInput(e) {
    this.accountAddress = e.target.value;
  }

  ////分页切换
  @autobind
  onPageChange(page, pageSize) {
    const { store: { account } } = this.props;
    account.setCurrent(page);
    this.Search();
  }

  @computed get tableColumns() {
    return [{
      title: '账户地址',
      dataIndex: 'address',
      key: 'address',
      width: '25%'
    }, {
      title: '账户公钥',
      dataIndex: 'pubKey',
      key: 'pubKey',
      width: '25%',
      render: (text, record, index) => nj`
       ${text}<br/>算法：${tranBase58(text)}
      `()
    },
    {
      title: 'KV',
      dataIndex: 'address',
      key: 'kv',
      render: (text, record, index) => nj`
        <KvCount address=${text} key=${text}/>
      `()
    },
    {
      title: '操作',
      render: (text, record, index) => nj`
       <a  onClick=${() => this.onShowAccount(record, index)}>查看</a>
      `()
    }];
  }

  @autobind
  onShowAccount(record, index){
    let ledger=this.props.store.common.getDefaultLedger();
    Promise.all([this.getAccount(ledger, record.address)]).then(() => {
    });

  }

  // 数据账户
  getAccount(ledger,address) {
    return fetchData(`${__HOST}/ledgers/${ledger}/accounts/address/${address}`,
        this.setAccount,
        {}, {
          method: 'get',
          headers: {
            cookie: document.cookie,
          }
        }
    ).catch(error => {

    });
  };

  @autobind
  setAccount(result) {
    if (result&&result.success) {
      this.accountData =result.data;
      this.show = !this.show;
    } else{
      this.accountData = '';
    }
  }

  @autobind
  onShow(record, index) {
    this.accountData = record;
    this.show = !this.show;
  }

  render() {
    const { store: { account } } = this.props;
    return tmpls.container({
      components: {
        MonacoEditor,
        'ant-Drawer': Drawer
      }
    }, this.props, this, {
        styles,
        account,
        tableData: toJS(account.tableData),
      });
  }
}