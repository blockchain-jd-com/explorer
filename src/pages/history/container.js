﻿import React, { Component } from 'react';
import { observable, computed, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import nj from 'nornj';
import Base58 from 'base58';
import { registerTmpl } from 'nornj-react';
import '../../common/containerConfig';
import 'flarej/lib/components/antd/button';
import 'flarej/lib/components/antd/input';
import 'flarej/lib/components/antd/breadcrumb';
import 'flarej/lib/components/antd/table';
import 'flarej/lib/components/antd/radio';
import { Message } from 'flarej/lib/components/antd/message';
import { autobind } from 'core-decorators';
import $ from 'jquery';
import '../../components/header';
import '../../components/sider';
import BlockHistory from './blockHistory';
import ContainerHoc from '../../components/higherOrders/container';
import styles from './history.m.less';
import tmpls from './history.t.html';
import HistoryStore from '../../stores/HistoryStore';
const historyStore = new HistoryStore();

//页面容器组件
@inject('store')
@observer
class Container extends Component {
  componentDidMount() {
    console.log(Base58);
  }

  render() {
    return this.props.tmpls[0](this, {
      styles
    });
  }
}
ContainerHoc('Container', Container, historyStore); 

// 历史页面组件
@registerTmpl('DataTable')
@inject('store')
@observer
class DataTable extends Component {
  @observable placeholder = '请输入区块高度';
  @observable radioValue = 'blockHeight';

  handleHashChange = (e) => {
    this.radioValue = e.target.value;
    this.placeholder = 
      this.radioValue == 'blockHash' ? '请输入区块哈希' : 
        this.radioValue == 'transactionHash' ? '请输入交易哈希' : '请输入区块高度';
  }

  render() {
    return tmpls.dataTable(this.state, this.props, this, {
      styles
    });
  }
}

// 区块高度/区块哈希数据页面
@registerTmpl('BlockHeight')
@inject('store')
@observer
class BlockHeight extends Component {
  render() {
    return tmpls.blockHeight(this.state, this.props, this, {
      styles
    });
  }
}

// 交易哈希数据页面
@registerTmpl('TransactionHash')
@inject('store')
@observer
class TransactionHash extends Component {
  @observable showEndpoint = false; // 是否显示节点终端列表, 默认隐藏
  @observable showNode = false; // 是否显示节点签名列表, 默认隐藏
  @observable showTrans = true; // 是否显示交易内容, 默认显示
  @observable showValue = false; // 是否显示value与预期版本

  /**
   * 控制显示隐藏
   * @val: 控制显示隐藏字段, Boolean
   */
  // handleValueShow = (val) => {
  //   val = !val;
  // }

  // 控制终端签名显示隐藏
  handleEndpointShow = () => {
    this.showEndpoint = !this.showEndpoint;
  }

  // 控制节点签名显示隐藏
  handleNodeShow = () => {
    this.showNode = !this.showNode;
  }

  // 控制交易内容显示隐藏
  handleTranShow = () => {
    this.showTrans = !this.showTrans;
  }

  // 控制值显示隐藏
  handleValueShow = () => {
    this.showValue = !this.showValue;
  }

  render() {
    return tmpls.transactionHash(this.state, this.props, this, {
      styles
    });
  }
}

if (module.hot) {
  module.hot.accept();
  njr.renderTmplTag({ target: '#container' });
}