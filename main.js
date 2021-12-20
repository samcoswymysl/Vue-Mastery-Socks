const eventBus = new Vue;

const  app = new Vue({
el: '#app',
    data: {
        premium: true,
        cart: [],
        index: -1
    },
    methods: {
        addOneToCart(id) {
        this.cart.push(id)
    },
        removeOneFromCart(id) {
            if (this.cart.length <= 0) return;
         this.index = this.cart.findIndex(el => el === id)
            if(this.index === -1) return
            this.cart.splice(this.index, 1)
        }
    },
})


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true,
            default: false,
        },
        quantity: {
            type: Number,
            required: true
        }
    },

    template: `
      <div class="product">
      <div class="product-image">
        <img v-bind:src="image" :alt="description">
      </div>
      <div class="product-info">
        <h1>{{ title }}</h1>
        <p v-if="inventory > 10">In Stock</p>
        <p v-else-if="inventory <= 10 && inventory > 0">Almost sold out!</p>
        <p
            v-else
            :class="{outOfStack: inventory <= 0}"
        >Out of Stock</p>
        <shopping :shipping="shipping"/>
        <p>{{ sale }}</p>
        <p>{{ description }}</p>
        <detailsComponent :details="details"/>
        <a :href="link" target="_blank">More products like this</a>
        <p>Colors:</p>
        <div
            v-for="(variant, index) in variants"
            :key="variant.variantId"
            class="color-box"
            :style="{backgroundColor: variant.variantColor}"
            @mouseover="updateProduct(index)"
        >
        </div>
        <p>Sizes:</p>
        <ul>
          <li v-for="size in sizes" :key="size">{{ size }}</li>
        </ul>
        <button
            @click="addToCart"
            :disabled="inventory <= 0"
            :class="{disabledButton: inventory <= 0}"
        >Add to Cart
        </button>

        <button
            @click="removeFromCart"
            :disabled="quantity <= 0"
            :class="{disabledButton: quantity <= 0}"
        >Remove from Cart
        </button>

      </div>
      <products-tabs :reviews="reviews" />
      </div>`,

    data() {
        return {

            brand: "Vue Mastery",
            product: 'Socks',
            description: 'A pair of warm, fuzzy socks',
            selectedVariant: 0,
            // image: './greenSocks.jpg',
            link: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
            // inventory: 100,
            onSale: true,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId:2213,
                    variantColor:'green',
                    variantImage: './greenSocks.jpg',
                    variantQuantity: 10,
                },
                {
                    variantId: 4322,
                    variantColor: "blue",
                    variantImage: './blueSocks.jpg',
                    variantQuantity: 0,
                }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            reviews: [],
        }
    },
    methods: {
        addToCart(){
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart(){
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index){
            this.selectedVariant = index
        },
    },

    computed: {
        title(){
            return `${this.brand} ${this.product}`
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inventory() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            return  this.onSale ? `${this.title} are on sale` : `${this.title} are not on sale`
        },
        shipping() {
            if(this.premium){
                return 'Free'
            }
            return '$9.99'
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => this.reviews.push(productReview) )
    }
})


Vue.component('detailsComponent', {
    props: {
        details: {
            type: Array,
            required: true,
        }
    },
    template: `   
      <ul>
    <li v-for="detail in details">{{detail}}</li>
    </ul>`
})


Vue.component('product-review', {
    template: `
      <div>
                <form class="review-form" @submit.prevent="onSubmit">
                  <div v-if="errors.length">
                    <p v-for="error in errors">{{error}}</p>
                  </div>
                  
                <p>
                  <label for="name" >Name</label>
                  <input 
                      type="text" 
                      id="name"
                      v-model="name"
                  >
                </p>
                <p>
                  <label for="review">Review</label>
                  <textarea 
                      name="" 
                      id="review" 
                      cols="30" 
                      rows="10"
                      v-model="review"
                  ></textarea>
                </p>
                <p>
                  <label for="rating">Rating</label>
                  <select id="rating" v-model.number="rating">
                      <option>5</option>
                      <option>4</option>
                      <option>3</option>
                      <option>2</option>
                      <option>1</option>
                  </select>
                </p>
                    <p>Would tou recommended this product</p>
                    <label for="yes">Yes
                    <input
                        type="radio"
                        id="yes"
                        name="recommended"
                        value="Yes"
                        v-model="recommend"
                    ></label>
                    <label for="no">No
                    <input
                        type="radio"
                        id="no"
                        name="recommended"
                        value="No"
                        v-model="recommend"
                    ></label>
                <p><input type="submit" value="Submit">
                </p>
                  
                </form>
      </div>`,

    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: [],
        };
    },
    methods: {
        onSubmit(){
            this.errors = []
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                };
                eventBus.$emit('review-submitted', productReview)
                this.name = null;
                this.review = null;
                this.rating = null;
                this.recommend = null;
            } else {
                if( !this.name) this.errors.push('Name is required');
                if( !this.review) this.errors.push('Review is required');
                if( !this.rating) this.errors.push('Rating is required');
                if( this.recommend === null) this.errors.push('Recommend is required');
            }
        }
    }
})

Vue.component('products-tabs', {
    props: {
        reviews: Array,
    },
    template: `
<div>
    <span 
        class="tab" 
        :class="{activeTab: selectedTab === tab}"
        v-for="(tab, index) in tabs" 
        :key="index"
        @click="selectedTab = tab"
    >
      {{tab}}
    </span>
    
    <div v-show="selectedTab === 'Reviews'">
      <p v-if="!reviews.length">There are no reviews yet</p>
      <ul>
        <li v-for="review in reviews">
          <p>{{review.name }}</p>
          <p>Rating {{review.rating }}</p>
          <p>Review {{review.review }}</p>
          <p>Recommend {{review.recommend }}</p>
        </li>
      </ul>
    </div>

    <product-review
        v-show="selectedTab === 'Make a Review'"/>
</div>`,
    data() {
        return {
            tabs:['Reviews', 'Make a Review'],
            selectedTab:'Reviews',
        }
    },
})


Vue.component('shopping', {
    props: {
        shipping:  String,
    },
    template:`<p>Shipping: {{ shipping }}</p>`
})