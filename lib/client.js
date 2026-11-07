window.__ModuleLoader__.load({
	id: "@heshih433-oss/dsh-balance-badge",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const jsxRuntime = require("react/jsx-runtime");

		/** Dictionary namespace owned by this plugin. */
		const NS = "balance-badge";
		/** How often a visible page re-reads the balance. */
		const REFRESH_INTERVAL_MS = 15000;
		/** The account Remote methods report this client build to Platform. */
		const CLIENT_VERSION = "0.2.2-rc.1";

		const zh = {
			balance: "余额",
			bonus: "赠送",
			live: "实时",
			loading: "读取余额…",
			refreshing: "刷新中…",
			signedOut: "未登录",
			signedOutHint: "登录 DeepSeek 账号后显示余额",
			unavailable: "余额暂不可用",
			error: "余额读取失败",
			retry: "重试",
			refresh: "刷新余额",
			updated: "更新于 {time}"
		};
		const en = {
			balance: "Balance",
			bonus: "Bonus",
			live: "Live",
			loading: "Reading balance…",
			refreshing: "Refreshing…",
			signedOut: "Not signed in",
			signedOutHint: "Sign in to a DeepSeek account to see the balance",
			unavailable: "Balance unavailable",
			error: "Could not read the balance",
			retry: "Retry",
			refresh: "Refresh balance",
			updated: "Updated {time}"
		};

		const CSS = [
			".dbb-root{display:flex;align-items:center;gap:8px;box-sizing:border-box;height:28px;padding:0 16px;border-top:.5px solid var(--dsw-alias-border-l2,rgba(128,128,128,.22));color:var(--dsw-alias-label-secondary,#6b7280);font-size:12px;line-height:1;font-family:inherit;user-select:none}",
			".dbb-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary,#9ca3af);flex:none}",
			".dbb-dot[data-state=ready]{background:var(--dsw-alias-state-business-primary,#22a06b)}",
			".dbb-dot[data-state=error]{background:var(--dsw-alias-state-error-primary,#d9534f)}",
			".dbb-dot[data-state=warn]{background:var(--dsw-alias-state-warn-primary,#d98324)}",
			".dbb-label{white-space:nowrap}",
			".dbb-amount{color:var(--dsw-alias-label-primary,#111827);font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}",
			".dbb-sep{color:var(--dsw-alias-label-tertiary,#9ca3af);white-space:nowrap}",
			".dbb-bonus{color:var(--dsw-alias-label-secondary,#6b7280);font-variant-numeric:tabular-nums;white-space:nowrap}",
			".dbb-spacer{flex:1;min-width:8px}",
			".dbb-updated{color:var(--dsw-alias-label-tertiary,#9ca3af);font-variant-numeric:tabular-nums;white-space:nowrap}",
			".dbb-refresh{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#6b7280);font:inherit;font-size:14px;line-height:1;cursor:pointer}",
			".dbb-refresh:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}",
			".dbb-refresh:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#22a06b);outline-offset:1px}",
			".dbb-refresh:disabled{opacity:.55;cursor:default}",
			".dbb-spin{animation:dbb-spin .8s linear infinite}",
			"@keyframes dbb-spin{to{transform:rotate(360deg)}}",
			".dbb-retry{border:0;background:transparent;color:var(--dsw-alias-label-primary,#111827);text-decoration:underline;cursor:pointer;font:inherit;padding:0;margin-left:2px}",
			"@media (prefers-reduced-motion: reduce){.dbb-spin{animation:none}}"
		].join("");

		/** Inject the plugin stylesheet once, owned by the applying plugin page. */
		function injectStyles() {
			if (typeof document === "undefined") return;
			const tagId = "@heshih433-oss/dsh-balance-badge/balance-badge.css";
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@heshih433-oss/dsh-balance-badge";
			tag.dataset.pluginCss = tagId;
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}

		/**
		 * Format one Platform balance amount using the same display rules as the
		 * Account settings page: cents, grouped digits, and a floor for tiny values.
		 * @param {string} amount - decimal amount as returned by the Host.
		 * @param {string} currency - "CNY" or "USD".
			 * @returns {string} currency text.
		 */
		function formatMoney(amount, currency) {
			const symbol = currency === "CNY" ? "¥" : currency === "USD" ? "$" : "";
			const numeric = Number(amount);
			if (!Number.isFinite(numeric)) return symbol + String(amount);
			if (numeric === 0) return symbol + "0.00";
			const absolute = Math.abs(numeric);
			if (numeric < 0) {
				const shown = Math.max(absolute, 0.01);
				return "-" + symbol + decimal(shown, false);
			}
			if (absolute < 0.01) return "<" + symbol + "0.01";
			return symbol + decimal(absolute, true);
		}

		/**
		 * Format to cents; positive balances truncate like Platform, while negative
		 * balances keep the Platform minimum magnitude and ordinary rounding.
		 * @param {number} value - non-negative amount.
		 * @param {boolean} truncate - floor the cents instead of rounding.
		 * @returns {string} grouped decimal text.
		 */
		function decimal(value, truncate) {
			const cents = (truncate ? Math.floor(value * 100) : Math.round(value * 100)) / 100;
			try {
				return new Intl.NumberFormat(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}).format(cents);
			} catch {
				return cents.toFixed(2);
			}
		}

		/**
		 * Reduce the Host balance payload to what the bar renders.
		 * @param {null | { status: string, value?: Array, bonusWallets?: Array }} balance
		 * @returns {{ kind: "signed-out" | "unavailable" | "ready", wallets?: Array, bonus?: Array }}
		 */
		function describeBalance(balance) {
			if (balance === null) return { kind: "signed-out" };
			if (balance === undefined || balance.status !== "ready") return { kind: "unavailable" };
			const wallets = Array.isArray(balance.value) ? balance.value : [];
			const bonus = Array.isArray(balance.bonusWallets)
				? balance.bonusWallets.filter((wallet) => Number(wallet.balance) > 0)
				: [];
			return { kind: "ready", wallets, bonus };
		}

		function timeText(timestamp) {
			try {
				return new Date(timestamp).toLocaleTimeString(undefined, {
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit"
				});
			} catch {
				return new Date(timestamp).toTimeString().slice(0, 8);
			}
		}

		/**
		 * The bottom strip: a live balance, a bonus amount, a freshness stamp, and
		 * a manual refresh. Polling pauses while the page is hidden.
		 * @param {{ t: Function, readBalance: Function }} props
		 * @returns {object} React element.
		 */
		function BalanceBar({ t, readBalance }) {
			const [snapshot, setSnapshot] = React.useState({ status: "loading", balance: undefined, at: 0, message: "" });
			const [refreshing, setRefreshing] = React.useState(false);
			const mounted = React.useRef(true);
			const busy = React.useRef(false);

			const refresh = React.useCallback(async () => {
				if (busy.current) return;
				busy.current = true;
				setRefreshing(true);
				try {
					const balance = await readBalance();
					if (!mounted.current) return;
					setSnapshot({ status: "ok", balance, at: Date.now(), message: "" });
				} catch (error) {
					if (!mounted.current) return;
					setSnapshot({
						status: "error",
						balance: undefined,
						at: Date.now(),
						message: error !== null && error !== undefined ? String(error.message || error) : ""
					});
				} finally {
					busy.current = false;
					if (mounted.current) setRefreshing(false);
				}
			}, [readBalance]);

			React.useEffect(() => {
				mounted.current = true;
				void refresh();
				const tick = () => {
					if (typeof document === "undefined" || document.visibilityState !== "hidden") void refresh();
				};
				const timer = window.setInterval(tick, REFRESH_INTERVAL_MS);
				const onVisibility = () => {
					if (document.visibilityState === "visible") void refresh();
				};
				const onFocus = () => void refresh();
				document.addEventListener("visibilitychange", onVisibility);
				window.addEventListener("focus", onFocus);
				return () => {
					mounted.current = false;
					window.clearInterval(timer);
					document.removeEventListener("visibilitychange", onVisibility);
					window.removeEventListener("focus", onFocus);
				};
			}, [refresh]);

			let dotState = "idle";
			let content;
			let tooltip;

			if (snapshot.status === "loading") {
				content = jsxRuntime.jsx("span", { className: "dbb-label", children: t("loading") });
			} else if (snapshot.status === "error") {
				dotState = "error";
				tooltip = snapshot.message || t("error");
				content = jsxRuntime.jsxs(jsxRuntime.Fragment, {
					children: [
						jsxRuntime.jsx("span", { className: "dbb-label", children: t("error") }),
						jsxRuntime.jsx("button", {
							type: "button",
							className: "dbb-retry",
							onClick: () => void refresh(),
							children: t("retry")
						})
					]
				});
			} else {
				const view = describeBalance(snapshot.balance);
				if (view.kind === "signed-out") {
					tooltip = t("signedOutHint");
					content = jsxRuntime.jsx("span", { className: "dbb-label", children: t("signedOut") });
				} else if (view.kind === "unavailable") {
					dotState = "warn";
					content = jsxRuntime.jsx("span", { className: "dbb-label", children: t("unavailable") });
				} else {
					dotState = "ready";
					const parts = [
						jsxRuntime.jsx("span", { className: "dbb-label", children: t("balance") }, "label"),
						...view.wallets.map((wallet, index) =>
							jsxRuntime.jsx("span", {
								className: "dbb-amount",
								children: formatMoney(wallet.balance, wallet.currency)
							}, "wallet-" + String(wallet.currency || index))
						)
					];
					if (view.bonus.length > 0) {
						parts.push(jsxRuntime.jsx("span", { className: "dbb-sep", children: "·" }, "sep"));
						parts.push(jsxRuntime.jsx("span", { className: "dbb-label", children: t("bonus") }, "bonus-label"));
						parts.push(...view.bonus.map((wallet, index) =>
							jsxRuntime.jsx("span", {
								className: "dbb-bonus",
								children: formatMoney(wallet.balance, wallet.currency)
							}, "bonus-" + String(wallet.currency || index))
						));
					}
					content = jsxRuntime.jsx(jsxRuntime.Fragment, { children: parts });
					tooltip = [
						t("balance"),
						...view.wallets.map((wallet) => formatMoney(wallet.balance, wallet.currency)),
						view.bonus.length > 0
							? t("bonus") + " " + view.bonus.map((wallet) => formatMoney(wallet.balance, wallet.currency)).join(" / ")
							: ""
					].filter(Boolean).join(" ");
				}
			}

			return jsxRuntime.jsxs("div", {
				className: "dbb-root",
				title: tooltip,
				children: [
					jsxRuntime.jsx("span", { className: "dbb-dot", "data-state": dotState, "aria-hidden": "true" }),
					content,
					jsxRuntime.jsx("span", { className: "dbb-spacer" }),
					snapshot.at > 0 && jsxRuntime.jsx("span", {
						className: "dbb-updated",
						children: t("updated", { time: timeText(snapshot.at) })
					}),
					jsxRuntime.jsxs("button", {
						type: "button",
						className: "dbb-refresh",
						onClick: () => void refresh(),
						disabled: refreshing,
						title: refreshing ? t("refreshing") : t("refresh"),
						"aria-label": refreshing ? t("refreshing") : t("refresh"),
						children: [jsxRuntime.jsx("span", {
							className: refreshing ? "dbb-spin" : undefined,
							"aria-hidden": "true",
							children: "↻"
						})]
					})
				]
			});
		}

		const inject = ["slots", "locale", "remote", "remote.account"];

		/**
		 * Client plugin body: register dictionaries and the balance strip.
		 * @param {object} ctx - client root context.
		 */
		function apply(ctx) {
			injectStyles();
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "balance-badge: dictionaries");

			const readBalance = async () => {
				const active = ctx.locale.getSnapshot().active;
				const result = await ctx.remote.account.getBalance({
					version: CLIENT_VERSION,
					locale: active,
					timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60
				});
				if (result === null || result === undefined || result.ok !== true) {
					const error = new Error(
						result && result.error && result.error.message ? result.error.message : "account balance request failed"
					);
					error.code = result && result.error ? result.error.code : undefined;
					throw error;
				}
				return result.value;
			};

			ctx.slots.inject("shell.bottom", () => ctx.slots.register({
				name: "shell.bottom",
				id: "balance-badge",
				locale: NS,
				inject: () => ({ readBalance })
			}, BalanceBar));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});