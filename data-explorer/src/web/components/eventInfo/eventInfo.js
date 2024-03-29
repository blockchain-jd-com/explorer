import React, { Component } from 'react';
import { observable, computed, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import nj from 'nornj';
import styles from './eventInfo.m.scss';
import {formatBase64Data} from '../../../utils/util';

import { Badge, Col, Drawer, Message, Row, Table, Icon } from 'antd';

function arrayIndexOf(arr, val) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] == val) {
            return i;
        }
    }
    return -1;
}
function arrayRemove(arr, val) {
    var index = arrayIndexOf(arr, val);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}


//页面容器组件
@inject('store')
@observer
export default class EventInfo extends Component {
    constructor(props) {
        super(props);
    }

    @observable pageSize = 10;
    @observable pageEvent = 10;
    @observable visible = false;
    @observable visibleLast = false;
    // @observable expandedRowKeys = [];
    @observable expandedRowKeysName = [];

    onPageChange = (page, pageSize) => {
        const { data, store: { common, event } } = this.props;
        const closeLoading = Message.loading('正在获取数据...', 0);

        event.setEvent(page);

        let param = {
            fromIndex: (event.eventCurrent - 1) * this.pageSize,
            count: this.pageSize,
        };
        let address = data.address && data.address || '';


        // 查询事件列表
        Promise.all([
            event.getEventCount(common.getDefaultLedger(), address)
        ]).then(() => {
            if (event.eventTotal > 0) {
                Promise.all([
                    event.getEventData(common.getDefaultLedger(), address, param)
                ]).then(() => {
                    closeLoading();
                });
            } else {
                closeLoading();
            }
        })
    }

    onPageChangeName = (page, pageSize, record) => {
        const { data, store: { common, event } } = this.props;
        event.setName(page);
        this.expandedRowKeysName = [];
        let address = data.address && data.address || '';
        let param = {
            fromSequence: (event.nameCurrent - 1) * this.pageEvent,
            count: this.pageEvent,
        }



        Promise.all([
            event.getNameCount(common.getDefaultLedger(), address, event.nameRecord)
        ]).then(() => {
            if (event.nameTotal) {
                Promise.all([
                    event.getEventName(common.getDefaultLedger(), address, event.nameRecord, param)
                ]).then(() => {

                })
            }
        })
    }

    onShow = (record, index) => {
        const { data, store: { common, event } } = this.props;
        let address = data.address && data.address || '';
        let param = {
            fromSequence: (event.nameCurrent - 1) * this.pageEvent,
            count: this.pageEvent,
        }
        event.setNameRecord(record)
        Promise.all([
            event.getNameCount(common.getDefaultLedger(), address, record)
        ]).then(() => {
            if (event.nameTotal) {
                Promise.all([
                    event.getEventName(common.getDefaultLedger(), address, record, param)
                ]).then(() => {
                    this.visible = true;
                })
            }
        })

    }

    onClose = () => {
        const { data, store: { common, event } } = this.props;
        this.visible = false;
        event.setName(1)
    }

    onCloseLast = () => {
        const { data, store: { common, event } } = this.props;
        this.visibleLast = false;
        // event.setName(1)
    }

    onShowLatest = (e, record) => {
        const { data, store: { common, event } } = this.props;
        let address = data.address && data.address || '';


        Promise.all([
            event.getEventLatest(common.getDefaultLedger(), address, record)
        ]).then(() => {
            this.visibleLast = true
        })

    }

    expandedRowRender = () => {
        const { store: { event } } = this.props;
        let data = event.dataLatest && { ...event.dataLatest } || {}
        return (
            <div>
                <div>
                    <h4>最新事件</h4>
                    <Row className={styles.gl}>
                        <Col span={2} xs={24} sm={8} lg={2}>事件序列:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.sequence && data.sequence || 0}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>事件账户:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.eventAccount && data.eventAccount || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>事件名称:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.name && data.name || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>交易哈希:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.transactionSource && data.transactionSource || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>区块高度:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.blockHeight && data.blockHeight || 0}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>合约地址:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.contractSource && data.contractSource || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>类型:</Col>
                        <Col span={22} xs={72} sm={40} lg={22}>{data.content && data.content.type || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>值:</Col>
                        <Col span={22} xs={72} sm={40} lg={22}>{formatBase64Data(data.content && data.content.type && data.content.type || '',
                            data.content && data.content.bytes || '')}</Col>
                    </Row>
                </div>
            </div>
        )
    }

    eventColumns = () => {
        return [{
            dataIndex: 'event',
            title: '事件名称',
            render: (text, record, index) => (
                <div>
                    <span>{record || ''}</span>
                    &nbsp;
                    <Icon type="search" style={{ color: '#1890ff', cursor: 'pointer' }} onClick={e => this.onShowLatest(e, record)} />
                </div>

            )
        }, {
            dataIndex: 'operate',
            title: '操作',
            render: (text, record, index) => (
                <a onClick={() => this.onShow(record, index)}>详情</a>
            )
        }]
    }

    handleExpandShowName = (expanded, record) => {
        if (expanded) {
            let testArr = [];
            testArr.push(record.index);
            this.expandedRowKeysName = [...testArr];
        } else {
            this.expandedRowKeysName = [...arrayRemove(this.expandedRowKeysName, record.index)]
        }
    }

    nameColumns = () => {

        return [{
            dataIndex: 'sequence',
            title: '事件序列',
        },
        {
            dataIndex: 'transactionSource',
            title: '交易哈希',
        },
        {
            title: '合约地址',
            dataIndex: 'contractSource',
        },
        {
            title: '区块高度',
            dataIndex: 'blockHeight',
        },
        ]
    }

    eventContent = record => {
        return (
            <div className={styles.info}>
                <Row className={styles.gl}>
                    <Col span={4} xs={24} sm={8} lg={4}>事件账户:</Col>
                    <Col span={20} xs={24} sm={16} lg={20}>{record.eventAccount && record.eventAccount || ''}</Col>

                    <Col span={4} xs={24} sm={8} lg={4}>事件名称:</Col>
                    <Col span={8} xs={24} sm={16} lg={8}>{record.name && record.name || ''}</Col>

                    <Col span={4} xs={24} sm={8} lg={4}>类型:</Col>
                    <Col span={8} xs={24} sm={16} lg={8}>{record.content && record.content.type && record.content.type || ''}</Col>

                    <Col span={4} xs={24} sm={8} lg={4}>值:</Col>
                    <Col span={8} xs={24} sm={16} lg={20}>{formatBase64Data(record.content && record.content.type && record.content.type || '',
                        record.content && record.content.bytes || '')}</Col>
                </Row>
            </div>
        )
    }

    render() {
        const { data, store: { event } } = this.props;
        let latest = event.dataLatest && { ...event.dataLatest } || {}
        return (
            <div>
                <h3>账户详情</h3>
                <div className={styles.info}>
                    <Row className={styles.gl}>
                        <Col span={2} xs={24} sm={8} lg={2}>地址:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.address || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>公钥:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.pubKey || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>创建用户:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.permission && data.permission.owners || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>所属角色:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.permission && data.permission.role || 'DEFAULT'}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>权限值:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.permission && data.permission.modeBits || ''}</Col>

                        <Col span={2} xs={24} sm={8} lg={2}>事件名总数:</Col>
                        <Col span={10} xs={24} sm={16} lg={10}>{data.dataset && data.dataset.dataCount}</Col>

                    </Row>

                    <h3>事件列表</h3>
                    <Table
                        rowKey={record => record}
                        dataSource={event.dataEvent}
                        columns={this.eventColumns()}
                        pagination={{
                            current: event.eventCurrent,
                            pageSize: this.pageSize,
                            total: event.eventTotal,
                            onChange: this.onPageChange,
                            showQuickJumper: true
                        }}
                    />
                </div>

                <Drawer
                    title="最新事件"
                    maskClosable={false}
                    onClose={this.onCloseLast}
                    visible={this.visibleLast}
                    width={1200}
                >
                    <div>
                        <div className={styles.info}>
                            {/* <h4>最新事件</h4> */}
                            <Row className={styles.gl}>
                                <Col span={2} xs={24} sm={8} lg={2}>事件序列:</Col>
                                <Col span={10} xs={24} sm={16} lg={10}>{latest.sequence && latest.sequence || 0}</Col>

                                <Col span={2} xs={24} sm={8} lg={2}>事件账户:</Col>
                                <Col span={10} xs={24} sm={16} lg={10}>{latest.eventAccount && latest.eventAccount || ''}</Col>

                                <Col span={2} xs={24} sm={8} lg={2}>事件名称:</Col>
                                <Col span={10} xs={24} sm={16} lg={10}>{latest.name && latest.name || ''}</Col>

                                <Col span={2} xs={24} sm={8} lg={2}>交易哈希:</Col>
                                <Col span={10} xs={24} sm={16} lg={10}>{latest.transactionSource && latest.transactionSource || ''}</Col>

                                <Col span={2} xs={24} sm={8} lg={2}>区块高度:</Col>
                                <Col span={10} xs={24} sm={16} lg={10}>{latest.blockHeight && latest.blockHeight || 0}</Col>

                                <Col span={2} xs={24} sm={8} lg={2}>合约地址:</Col>
                                <Col span={10} xs={24} sm={16} lg={10}>{latest.contractSource && latest.contractSource || ''}</Col>

                                <Col span={2} xs={24} sm={8} lg={2}>类型:</Col>
                                <Col span={22} xs={72} sm={40} lg={22}>{latest.content && latest.content.type || ''}</Col>

                                <Col span={2} xs={24} sm={8} lg={2}>值:</Col>
                                <Col span={22} xs={72} sm={40} lg={22}>{formatBase64Data(latest.content && latest.content.type && latest.content.type || '',
                                    latest.content && latest.content.bytes || '')}</Col>
                            </Row>
                        </div>
                    </div>
                </Drawer>

                <Drawer
                    title="历史记录"
                    maskClosable={false}
                    onClose={this.onClose}
                    visible={this.visible}
                    width={1200}
                >
                    <Table
                        rowKey={record => record.index}
                        dataSource={event.dataName}
                        columns={this.nameColumns()}
                        pagination={{
                            current: event.nameCurrent,
                            pageSize: this.pageEvent,
                            total: event.nameTotal,
                            onChange: (page, pageSize, record) => this.onPageChangeName(page, pageSize, record),
                            showQuickJumper: true
                        }}
                        onExpand={(expanded, record) => this.handleExpandShowName(expanded, record)}
                        expandedRowKeys={this.expandedRowKeysName}
                        expandedRowRender={record => this.eventContent(record)}
                    />
                </Drawer>
            </div>
        )
    }
}