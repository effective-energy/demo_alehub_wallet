<template>
    <div class="top">
        <div class="searchControl" @click="makeFocusSearch()">
            <img :src="getIcon('search')" width="16" height="16">
            <input
                    type="text"
                    id="search-transactions"

                    @input="searchTransaction()"
                    :placeholder="$t('pages.summary.searchPanel.search')"
                    v-model="searchCurrentText">
        </div>

        <send-request/>
    </div>
</template>

<script>
    import SendRequest from './SendRequest';

    import {mapGetters} from 'vuex';

    export default {
        name: 'transactions-operation-tool-panel',
        components: {
            SendRequest
        },
        props: {
            resetSearch: {
                type: Boolean
            }
        },
        watch: {
            'resetSearch': function (val) {
                if (val) {
                    this.searchCurrentText = '';
                    this.$parent.$emit('successResetSearchToTool');
                }
            }
        },
        data() {
            return {
                searchCurrentText: ''
            }
        },
        computed: {
            selectedTheme() {
                return this.$store.state.Themes.theme;
            }
        },
        methods: {
            makeFocusSearch: function () {
                document.getElementById('search-transactions').focus();
            },
            searchTransaction: function () {

                this.$store.dispatch('setSearchText',
                    this.searchCurrentText
                ).then(() => {
                    // console.log('Success set search text');
                }).catch(() => {
                    console.log('Error set search text');
                });

            },
            getIcon: function (name) {
                if (this.selectedTheme === 'dark')
                    return require(`../../assets/img/${name}_dark.svg`);
                else if (this.selectedTheme === 'white')
                    return require(`../../assets/img/${name}_white.svg`);

                return require(`../../assets/img/${name}.svg`);
            }
        }
    }
</script>

<style lang="stylus" scoped>
    //переместить эти стили в общие

    .top
        display flex
        justify-content space-between
        align-items flex-end
        padding-bottom 18px
        border-bottom 1px solid #d1d1d1
        margin-bottom 24px

        .searchControl
            display flex
            justify-content flex-start
            width calc(100% - 350px)
            cursor pointer

            input
                background none
                outline none
                border none
                border-bottom 1px solid #ccc
                opacity 0.5
                font-family MuseoSansCyrl300
                font-size 14px
                line-height 1.29
                color #34343e
                margin-left 18px
                padding 0
                margin-top 0

                &:focus
                    width 100% !important
                    @media screen and (max-width: 768px)
                        width auto !important

        #search-transactions
            width auto

    @media(max-width: 600px) 
        .top
            flex-direction column
            align-items flex-start

            .searchControl
                margin-bottom 20px

</style>