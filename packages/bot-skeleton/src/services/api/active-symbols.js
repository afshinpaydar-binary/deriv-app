import { localize } from '@deriv/translations';
import PendingPromise from '../../utils/pending-promise';
import { config } from '../../constants/config';

export default class ActiveSymbols {
    constructor(ws, trading_times) {
        this.active_symbols = [];
        this.disabled_markets = [];
        this.disabled_symbols = ['frxGBPNOK', 'frxUSDNOK', 'frxUSDNEK', 'frxUSDSEK']; // These are only forward-starting.
        this.disabled_submarkets = ['energy']; // These are only forward-starting.
        this.init_promise = new PendingPromise();
        this.is_initialised = false;
        this.processed_symbols = {};
        this.trading_times = trading_times;
        this.ws = ws;
    }

    async retrieveActiveSymbols(is_forced_update = false) {
        await this.trading_times.initialise();

        if (!is_forced_update && this.is_initialised) {
            await this.init_promise;
            return this.active_symbols;
        }

        this.is_initialised = true;

        const { active_symbols } = await this.ws.activeSymbols();

        this.active_symbols = active_symbols;
        this.processed_symbols = this.processActiveSymbols();
        this.trading_times.onMarketOpenCloseChanged = changes => {
            Object.keys(changes).forEach(symbol_name => {
                const symbol_obj = this.active_symbols[symbol_name];

                if (symbol_obj) {
                    symbol_obj.exchange_is_open = changes[symbol_name];
                }
            });

            this.changes = changes;
            this.processActiveSymbols();
        };

        this.init_promise.resolve();

        return this.active_symbols;
    }

    processActiveSymbols() {
        return this.active_symbols.reduce((processed_symbols, symbol) => {
            if (
                this.disabled_markets.includes(symbol.market) ||
                this.disabled_symbols.includes(symbol.symbol) ||
                this.disabled_submarkets.includes(symbol.submarket)
            ) {
                return processed_symbols;
            }

            const isExistingValue = (object, prop) => Object.keys(object).findIndex(a => a === symbol[prop]) !== -1;

            if (!isExistingValue(processed_symbols, 'market')) {
                processed_symbols[symbol.market] = {
                    display_name: symbol.market_display_name,
                    submarkets: {},
                };
            }

            const { submarkets } = processed_symbols[symbol.market];

            if (!isExistingValue(submarkets, 'submarket')) {
                submarkets[symbol.submarket] = {
                    display_name: symbol.submarket_display_name,
                    symbols: {},
                };
            }

            const { symbols } = submarkets[symbol.submarket];

            if (!isExistingValue(symbols, 'symbol')) {
                symbols[symbol.symbol] = {
                    display_name: symbol.display_name,
                    pip_size: `${symbol.pip}`.length - 2,
                    is_active: !symbol.is_trading_suspended && symbol.exchange_is_open,
                };
            }

            return processed_symbols;
        }, {});
    }

    /**
     * Retrieves all symbols and returns an array of symbol objects consisting of symbol and their linked market + submarket.
     * @returns {Array} Symbols and their submarkets + markets.
     */
    getAllSymbols() {
        const all_symbols = [];

        Object.keys(this.processed_symbols).forEach(market_name => {
            const market = this.processed_symbols[market_name];
            const { submarkets } = market;

            Object.keys(submarkets).forEach(submarket_name => {
                const submarket = submarkets[submarket_name];
                const { symbols } = submarket;

                Object.keys(symbols).forEach(symbol_name => {
                    const symbol = symbols[symbol_name];

                    all_symbols.push({
                        market: market_name,
                        market_display: market.display_name,
                        submarket: submarket_name,
                        submarket_display: submarket.display_name,
                        symbol: symbol_name,
                        symbol_display: symbol.display_name,
                    });
                });
            });
        });

        return all_symbols;
    }

    async getMarketDropdownOptions() {
        await this.retrieveActiveSymbols();
        const market_options = [];

        Object.keys(this.processed_symbols).forEach(market_name => {
            const { display_name } = this.processed_symbols[market_name];
            const market_display_name =
                display_name + (this.isMarketClosed(market_name) ? ` ${localize('(Closed)')}` : '');
            market_options.push([market_display_name, market_name]);
        });

        if (market_options.length === 0) {
            return config.NOT_AVAILABLE_DROPDOWN_OPTIONS;
        }

        const has_closed_markets = market_options.some(market_option => this.isMarketClosed(market_option[1]));

        if (has_closed_markets) {
            const sorted_options = this.sortDropdownOptions(market_options, this.isMarketClosed);

            if (this.isMarketClosed('forex')) {
                return sorted_options.sort(a => (a[1] === 'synthetic_index' ? -1 : 1));
            }

            return sorted_options;
        }

        return market_options;
    }

    async getSubmarketDropdownOptions(market) {
        await this.retrieveActiveSymbols();

        const submarket_options = [];
        const market_obj = this.processed_symbols[market];

        if (market_obj) {
            const { submarkets } = market_obj;

            Object.keys(submarkets).forEach(submarket_name => {
                const { display_name } = submarkets[submarket_name];
                const submarket_display_name =
                    display_name + (this.isSubmarketClosed(submarket_name) ? ` ${localize('(Closed)')}` : '');
                submarket_options.push([submarket_display_name, submarket_name]);
            });
        }

        if (submarket_options.length === 0) {
            return config.NOT_AVAILABLE_DROPDOWN_OPTIONS;
        }

        return this.sortDropdownOptions(submarket_options, this.isSubmarketClosed);
    }

    async getSymbolDropdownOptions(submarket) {
        await this.retrieveActiveSymbols();

        const symbol_options = Object.keys(this.processed_symbols).reduce((accumulator, market_name) => {
            const { submarkets } = this.processed_symbols[market_name];

            Object.keys(submarkets).forEach(submarket_name => {
                if (submarket_name === submarket) {
                    const { symbols } = submarkets[submarket_name];
                    Object.keys(symbols).forEach(symbol_name => {
                        const { display_name } = symbols[symbol_name];
                        const symbol_display_name =
                            display_name + (this.isSymbolClosed(symbol_name) ? ` ${localize('(Closed)')}` : '');
                        accumulator.push([symbol_display_name, symbol_name]);
                    });
                }
            });

            return accumulator;
        }, []);

        if (symbol_options.length === 0) {
            return config.NOT_AVAILABLE_DROPDOWN_OPTIONS;
        }

        return this.sortDropdownOptions(symbol_options, this.isSymbolClosed);
    }

    isMarketClosed(market_name) {
        const market = this.processed_symbols[market_name];

        if (!market) {
            return true;
        }

        return Object.keys(market.submarkets).every(submarket_name => this.isSubmarketClosed(submarket_name));
    }

    isSubmarketClosed(submarket_name) {
        const market_name = Object.keys(this.processed_symbols).find(market_name => {
            const market = this.processed_symbols[market_name];
            return Object.keys(market.submarkets).includes(submarket_name);
        });

        if (!market_name) {
            return true;
        }

        const market = this.processed_symbols[market_name];
        const submarket = market.submarkets[submarket_name];

        if (!submarket) {
            return true;
        }

        const { symbols } = submarket;
        return Object.keys(symbols).every(symbol_name => this.isSymbolClosed(symbol_name));
    }

    isSymbolClosed(symbol_name) {
        let symbol = false;

        Object.keys(this.processed_symbols).some(market_name => {
            const market = this.processed_symbols[market_name];

            return Object.keys(market.submarkets).some(submarket_name => {
                const submarket = market.submarkets[submarket_name];

                return Object.keys(submarket.symbols).some(curr_symbol_name => {
                    if (symbol_name === curr_symbol_name) {
                        symbol = submarket.symbols[curr_symbol_name];
                        return true;
                    }

                    return false;
                });
            });
        });

        if (symbol) {
            return !symbol.is_active;
        }

        return true;
    }

    sortDropdownOptions = (dropdown_options, closedFunc) => {
        const options = [...dropdown_options];

        options.sort((a, b) => {
            const is_a_closed = closedFunc.call(this, a[1]);
            const is_b_closed = closedFunc.call(this, b[1]);

            if (is_a_closed && !is_b_closed) {
                return 1;
            } else if (is_a_closed === is_b_closed) {
                return 0;
            }
            return -1;
        });

        return options;
    };
}
