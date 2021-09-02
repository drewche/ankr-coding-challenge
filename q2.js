function detectSum(nums, target) {
    pairs = new Set()
    for (let i = 0; i < nums.length; i++) {
        pair = target - nums[i]
        if (pairs.has(pair)) {
            return true
        } else {
            pairs.add(nums[i])
        }
    }
    return false
}

tests = [
    { input: [[1,2,3,4,5,6,7,8], 5], answer: true },
    { input: [[1,2,3,4,5,6,7,8], 9], answer: true },
    { input: [[1,4,2,6,9,3,4,7], 8], answer: true },
    { input: [[1,1,1,1,1,1,1,1], 3], answer: false },
    { input: [[2,4,6,8,10,12,14], 7], answer: false },
]

function test() {
    for (let i = 0; i < tests.length; i++) {
        if (detectSum(...tests[i].input) != tests[i].answer) {
            console.log(`Failed test ${i+1}.`);
        }
    }
    console.log("Passed all test cases!");
}

test()