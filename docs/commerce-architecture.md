# 复利书房账户、支付与权益接入边界

当前站点使用 Next.js `output: "export"` 生成纯静态网站。公开馆藏可以继续静态部署；验证码登录、订单、支付回调、权益和受保护下载必须部署在可信服务端，不能用浏览器状态替代。

## 数据对象

```sql
create table users (
  id text primary key,
  email text unique,
  phone text unique,
  created_at timestamp not null,
  status text not null check (status in ('active', 'disabled'))
);

create table products (
  id text primary key,
  slug text unique not null,
  title text not null,
  price integer not null,
  version text not null,
  delivery_type text not null,
  active boolean not null default true
);

create table orders (
  id text primary key,
  user_id text not null references users(id),
  product_id text not null references products(id),
  amount integer not null,
  currency text not null default 'CNY',
  payment_channel text not null,
  payment_status text not null check (
    payment_status in ('created', 'pending', 'paid', 'failed', 'closed', 'refunded')
  ),
  created_at timestamp not null,
  paid_at timestamp,
  refunded_at timestamp
);

create table entitlements (
  id text primary key,
  user_id text not null references users(id),
  product_id text not null references products(id),
  order_id text not null references orders(id),
  status text not null check (status in ('active', 'revoked')),
  granted_at timestamp not null,
  revoked_at timestamp,
  unique (user_id, product_id, order_id)
);

create table payment_events (
  provider_event_id text primary key,
  order_id text not null references orders(id),
  event_type text not null,
  processed_at timestamp not null
);
```

## 必须由服务端完成

1. 生成邮箱或手机号验证码，并设置有效期、尝试次数和频率限制。
2. 创建订单时从服务端产品表读取价格，不相信浏览器提交的金额。
3. 微信支付二维码和支付宝收银台地址由服务端创建。
4. 支付回调验证平台签名、商户号、金额、币种与订单状态。
5. 以 `provider_event_id` 做唯一约束，幂等处理重复通知。
6. 订单从非 `paid` 状态首次变为 `paid` 时，才发放对应 `product_id` 的权益。
7. 两本合订本使用不同产品 ID，不通过“购买任意产品”授予全部访问权。
8. 下载地址由服务端验证当前用户的有效权益，再生成短时签名 URL。
9. 退款后记录 `refunded_at`，并根据购买时适用政策决定是否撤销权益。
10. 支付密钥、回调证书和下载签名密钥只保存在服务端环境变量或密钥系统中。

## 推荐接口

- `POST /auth/request-code`
- `POST /auth/verify-code`
- `GET /account`
- `GET /account/orders`
- `GET /account/entitlements`
- `POST /checkout/orders`
- `POST /checkout/:orderId/wechat`
- `POST /checkout/:orderId/alipay`
- `POST /webhooks/wechat`
- `POST /webhooks/alipay`
- `GET /downloads/:productId`
- `POST /orders/:orderId/refund-request`

## 上线支付前的阻断项

- 确认经营主体、支付商户号和结算账户。
- 确认邮箱或短信服务商及隐私合规流程。
- 明确“文件领取后是否可退款”和后续版本更新范围。
- 确认客服处理渠道、响应时间和退款审核流程。
- 完成支付回调签名测试、重复事件测试、金额篡改测试和越权下载测试。
